"""
NL2SQL Service — converts natural language questions to safe SQL queries,
executes them, and generates business answers.

Pipeline:
  1. Build prompt with schema context + few-shot examples
  2. Call LLM to generate SQL
  3. Validate generated SQL for safety
  4. Execute validated SQL against database
  5. Call LLM again to generate business answer from results
  6. Return full response
"""

import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.services.openrouter_service import call_llm, call_llm_with_context, OpenRouterError
from app.services.sql_validator import validate_sql

logger = logging.getLogger(__name__)

# ── System Prompt for SQL Generation ──────────────────────────────────────────
SQL_GENERATION_PROMPT = """You are an expert SQL query generator for a fashion/apparel ERP system.
Your job is to convert natural language questions into PostgreSQL SELECT queries.

DATABASE SCHEMA:
- buyers (id, company_name, contact_person, email, phone, country, city, address, payment_terms, credit_limit, status)
- suppliers (id, company_name, contact_person, email, phone, country, city, specialization, lead_time_days, rating, status)
- finished_goods (id, style_number, description, category, supplier, fabric, color, size_range, season, price, status, image_url)
- sales_orders (id, order_number, buyer, style_number, quantity, unit_price, total_amount, order_date, delivery_date, status)
- sales_invoices (id, invoice_number, sales_order, buyer, amount, tax, total, invoice_date, due_date, payment_status)
- tech_packs (id, style_number, description, fabric_details, measurements, construction_notes, status)

RELATIONSHIPS:
- finished_goods.supplier → suppliers.company_name
- sales_orders.buyer → buyers.company_name
- sales_orders.style_number → finished_goods.style_number
- sales_invoices.sales_order → sales_orders.order_number
- sales_invoices.buyer → buyers.company_name
- tech_packs.style_number → finished_goods.style_number

RULES:
1. Generate ONLY a single SELECT query
2. NEVER use INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, or REVOKE
3. Only query the tables listed above
4. Always include a LIMIT clause (max 100 rows)
5. Use proper JOINs when data from multiple tables is needed
6. Use aggregate functions (SUM, COUNT, AVG, MIN, MAX) for summary questions
7. Use ILIKE for case-insensitive text matching
8. Format dates properly for PostgreSQL
9. Return ONLY the SQL query, no explanation or markdown

EXAMPLES:

Question: Which buyer generated the highest revenue?
SQL: SELECT buyer, SUM(total_amount) AS revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 10

Question: How many products are in each category?
SQL: SELECT category, COUNT(*) AS count FROM finished_goods GROUP BY category ORDER BY count DESC LIMIT 20

Question: Show me all orders with status pending
SQL: SELECT order_number, buyer, style_number, quantity, total_amount, order_date, delivery_date FROM sales_orders WHERE status = 'pending' ORDER BY order_date DESC LIMIT 50

Question: What is the average order value by buyer?
SQL: SELECT buyer, ROUND(AVG(total_amount)::numeric, 2) AS avg_order_value, COUNT(*) AS order_count FROM sales_orders GROUP BY buyer ORDER BY avg_order_value DESC LIMIT 20

Question: Which supplier has the most products?
SQL: SELECT supplier, COUNT(*) AS product_count FROM finished_goods GROUP BY supplier ORDER BY product_count DESC LIMIT 10
"""

# ── System Prompt for Answer Generation ───────────────────────────────────────
ANSWER_GENERATION_PROMPT = """You are a business analyst for a fashion/apparel ERP system.
Given a user's question, the SQL query that was executed, and the results, provide a clear, concise business answer.

RULES:
1. Answer in 2-4 sentences maximum
2. Use specific numbers and names from the results
3. Be conversational but professional
4. If results are empty, say so clearly
5. Don't mention SQL or technical details — just answer the business question
6. Format numbers with proper separators (e.g., $1,500,000)
7. If the question asks for a ranking, highlight the top items
"""


async def process_question(question: str, db: AsyncSession) -> dict:
    """
    Full NL2SQL pipeline: question → SQL → validate → execute → answer.

    Args:
        question: The user's natural language question
        db: Database session

    Returns:
        Dict with: question, sql, rows, answer, confidence
    """
    if not question or not question.strip():
        return _error_response(question, "Please enter a question.")

    question = question.strip()

    # ── Step 1: Generate SQL from question ────────────────────────
    try:
        raw_sql = await call_llm(
            system_prompt=SQL_GENERATION_PROMPT,
            user_message=f"Question: {question}\nSQL:",
            temperature=0.1,
            max_tokens=500,
        )
    except OpenRouterError as e:
        logger.error(f"SQL generation failed: {e.message}")
        return _error_response(question, f"AI service error: {e.message}")

    # ── Step 2: Validate the generated SQL ────────────────────────
    is_valid, cleaned_sql, error_msg = validate_sql(raw_sql)

    if not is_valid:
        logger.warning(f"SQL validation failed: {error_msg} | Raw: {raw_sql}")
        return _error_response(
            question,
            f"I couldn't generate a safe query for that question. {error_msg}",
            sql=raw_sql,
        )

    # ── Step 3: Execute the validated SQL ─────────────────────────
    try:
        rows = await _execute_sql(db, cleaned_sql)
    except Exception as e:
        logger.error(f"SQL execution error: {e} | SQL: {cleaned_sql}")
        return _error_response(
            question,
            "There was a database error executing the query. Please try a simpler question.",
            sql=cleaned_sql,
        )

    # ── Step 4: Generate business answer ──────────────────────────
    confidence = _calculate_confidence(rows, cleaned_sql)

    try:
        answer = await _generate_answer(question, cleaned_sql, rows)
    except OpenRouterError as e:
        logger.error(f"Answer generation failed: {e.message}")
        # Still return results even if answer generation fails
        answer = _fallback_answer(rows)

    return {
        "question": question,
        "sql": cleaned_sql,
        "rows": rows,
        "answer": answer,
        "confidence": confidence,
    }


async def explain_result(question: str, sql: str, rows: list) -> dict:
    """
    Generate an AI explanation for existing query results.
    Used when the frontend wants a fresh explanation.
    """
    try:
        answer = await _generate_answer(question, sql, rows)
        confidence = _calculate_confidence(rows, sql)
        return {
            "explanation": answer,
            "confidence": confidence,
        }
    except OpenRouterError as e:
        return {
            "explanation": f"Unable to generate explanation: {e.message}",
            "confidence": 0.0,
        }


async def _execute_sql(db: AsyncSession, sql: str) -> list:
    """
    Execute validated SQL and return results as a list of dicts.
    Timeout is handled by the database connection settings.
    """
    result = await db.execute(text(sql))
    columns = result.keys()
    rows = []

    for row in result.fetchall():
        row_dict = {}
        for i, col in enumerate(columns):
            value = row[i]
            # Convert non-serializable types to string
            if value is not None and not isinstance(value, (str, int, float, bool)):
                value = str(value)
            row_dict[col] = value
        rows.append(row_dict)

    return rows


async def _generate_answer(question: str, sql: str, rows: list) -> str:
    """
    Use LLM to generate a business-friendly answer from query results.
    Only sends up to 20 rows to avoid token limits.
    """
    if not rows:
        return "No data was found for your question. The query was valid but returned no matching rows."

    # Limit context to 20 rows for token efficiency
    context_rows = rows[:20]
    context = (
        f"Question: {question}\n"
        f"SQL executed: {sql}\n"
        f"Results ({len(rows)} rows total, showing first {len(context_rows)}):\n"
        f"{json.dumps(context_rows, indent=2, default=str)}"
    )

    answer = await call_llm_with_context(
        system_prompt=ANSWER_GENERATION_PROMPT,
        user_message=question,
        context=context,
        temperature=0.3,
        max_tokens=300,
    )

    return answer


def _calculate_confidence(rows: list, sql: str) -> float:
    """
    Estimate confidence score based on result quality.
    Heuristic-based — not a true ML confidence metric.
    """
    if not rows:
        return 0.3  # Valid query but no results

    score = 0.6  # Base score for having results

    # More results = slightly higher confidence (up to a point)
    row_count = len(rows)
    if row_count >= 1:
        score += 0.1
    if row_count >= 3:
        score += 0.1

    # Presence of aggregate functions suggests a well-formed analytical query
    upper_sql = sql.upper()
    if any(fn in upper_sql for fn in ["SUM(", "COUNT(", "AVG(", "MAX(", "MIN("]):
        score += 0.1

    # Cap at 0.95
    return min(round(score, 2), 0.95)


def _fallback_answer(rows: list) -> str:
    """Simple fallback answer when LLM answer generation fails."""
    if not rows:
        return "No results found for your question."
    return f"Found {len(rows)} result(s). Please review the data table below."


def _error_response(question: str, error: str, sql: Optional[str] = None) -> dict:
    """Build a standardized error response."""
    return {
        "question": question,
        "sql": sql or "",
        "rows": [],
        "answer": error,
        "confidence": 0.0,
        "error": True,
    }
