"""
NL2SQL Service — uses Vanna AI framework for natural language to SQL conversion.

Pipeline:
  1. Vanna AI generates SQL from natural language using RAG + LLM
  2. SQL validator checks safety (SELECT only, allowed tables)
  3. Execute validated SQL against database
  4. Generate business answer from results
"""

import json
import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.services.vanna_service import get_vanna
from app.services.openrouter_service import call_llm_with_context, OpenRouterError
from app.services.sql_validator import validate_sql

logger = logging.getLogger(__name__)

# Answer generation prompt
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
    Full NL2SQL pipeline using Vanna AI: question → SQL → validate → execute → answer.
    """
    if not question or not question.strip():
        return _error_response(question, "Please enter a question.")

    question = question.strip()

    # ── Step 1: Generate SQL using Vanna AI ───────────────────────────────
    try:
        vn = get_vanna()
        raw_sql = vn.generate_sql(question=question)
    except Exception as e:
        logger.error(f"Vanna SQL generation failed: {e}")
        return _error_response(question, f"AI service error: {str(e)}")

    if not raw_sql or raw_sql.strip() == "":
        return _error_response(question, "Could not generate a query for that question. Please try rephrasing.")

    # ── Step 2: Validate the generated SQL ────────────────────────────────
    is_valid, cleaned_sql, error_msg = validate_sql(raw_sql)

    if not is_valid:
        logger.warning(f"SQL validation failed: {error_msg} | Raw: {raw_sql}")
        return _error_response(
            question,
            f"I couldn't generate a safe query for that question. {error_msg}",
            sql=raw_sql,
        )

    # ── Step 3: Execute the validated SQL ─────────────────────────────────
    try:
        rows = await _execute_sql(db, cleaned_sql)
    except Exception as e:
        logger.error(f"SQL execution error: {e} | SQL: {cleaned_sql}")
        return _error_response(
            question,
            "There was a database error executing the query. Please try a simpler question.",
            sql=cleaned_sql,
        )

    # ── Step 4: Generate business answer ──────────────────────────────────
    confidence = _calculate_confidence(rows, cleaned_sql)

    try:
        answer = await _generate_answer(question, cleaned_sql, rows)
    except (OpenRouterError, Exception) as e:
        logger.error(f"Answer generation failed: {e}")
        answer = _fallback_answer(rows)

    return {
        "question": question,
        "sql": cleaned_sql,
        "rows": rows,
        "answer": answer,
        "confidence": confidence,
    }


async def explain_result(question: str, sql: str, rows: list) -> dict:
    """Generate an AI explanation for existing query results."""
    try:
        answer = await _generate_answer(question, sql, rows)
        confidence = _calculate_confidence(rows, sql)
        return {
            "explanation": answer,
            "confidence": confidence,
        }
    except Exception as e:
        return {
            "explanation": f"Unable to generate explanation: {str(e)}",
            "confidence": 0.0,
        }


async def _execute_sql(db: AsyncSession, sql: str) -> list:
    """Execute validated SQL and return results as a list of dicts."""
    result = await db.execute(text(sql))
    columns = result.keys()
    rows = []

    for row in result.fetchall():
        row_dict = {}
        for i, col in enumerate(columns):
            value = row[i]
            if value is not None and not isinstance(value, (str, int, float, bool)):
                value = str(value)
            row_dict[col] = value
        rows.append(row_dict)

    return rows


async def _generate_answer(question: str, sql: str, rows: list) -> str:
    """Use LLM to generate a business-friendly answer from query results."""
    if not rows:
        return "No data was found for your question. The query was valid but returned no matching rows."

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
    """Estimate confidence score based on result quality."""
    if not rows:
        return 0.3
    score = 0.6
    if len(rows) >= 1:
        score += 0.1
    if len(rows) >= 3:
        score += 0.1
    upper_sql = sql.upper()
    if any(fn in upper_sql for fn in ["SUM(", "COUNT(", "AVG(", "MAX(", "MIN("]):
        score += 0.1
    return min(round(score, 2), 0.95)


def _fallback_answer(rows: list) -> str:
    if not rows:
        return "No results found for your question."
    return f"Found {len(rows)} result(s). Please review the data table below."


def _error_response(question: str, error: str, sql: Optional[str] = None) -> dict:
    return {
        "question": question,
        "sql": sql or "",
        "rows": [],
        "answer": error,
        "confidence": 0.0,
        "error": True,
    }
