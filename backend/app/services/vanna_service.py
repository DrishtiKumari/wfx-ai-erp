"""
Vanna AI-inspired NL2SQL Service — implements the Vanna framework pattern
(RAG + LLM for SQL generation) with OpenRouter as the LLM backend.

This follows the Vanna AI architecture (https://vanna.ai):
- Train on DDL schema + documentation + question-SQL examples
- Use RAG to retrieve relevant context for each question
- Generate SQL via LLM with structured prompts

We implement this without the heavy vanna pip package to keep deployment
lightweight (avoids chromadb, onnxruntime, pandas on Render).
"""

import httpx
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger(__name__)


class VannaNL2SQL:
    """
    Vanna AI-style NL2SQL engine using RAG (Retrieval-Augmented Generation).
    Trained with DDL, documentation, and example question-SQL pairs.
    Uses OpenRouter as the LLM backend.
    """

    def __init__(self):
        settings = get_settings()
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

        # Training data (in-memory RAG store)
        self._ddl_statements: list[str] = []
        self._documentation: list[str] = []
        self._sql_examples: list[dict] = []

    def add_ddl(self, ddl: str) -> None:
        """Store DDL for schema context."""
        self._ddl_statements.append(ddl)

    def add_documentation(self, doc: str) -> None:
        """Store documentation for context."""
        self._documentation.append(doc)

    def add_question_sql(self, question: str, sql: str) -> None:
        """Store question-SQL pair for few-shot examples."""
        self._sql_examples.append({"question": question, "sql": sql})

    def generate_sql(self, question: str) -> str:
        """
        Generate SQL from a natural language question using the Vanna RAG approach:
        1. Retrieve relevant DDL, docs, and examples
        2. Build a structured prompt
        3. Call LLM to generate SQL
        """
        prompt = self._build_prompt(question)
        return self._call_llm(prompt)

    def _build_prompt(self, question: str) -> list[dict]:
        """Build the Vanna-style prompt with schema context and few-shot examples."""
        # System message with schema context
        schema_context = "\n\n".join(self._ddl_statements)
        doc_context = "\n\n".join(self._documentation)

        system_msg = (
            "You are a SQL expert. Please help to generate a SQL query to answer the question. "
            "Your response should ONLY be based on the given context and follow the response guidelines.\n\n"
            f"===Tables\n{schema_context}\n\n"
            f"===Additional Context\n{doc_context}\n\n"
            "===Response Guidelines\n"
            "1. Generate a valid PostgreSQL SELECT query without any explanations.\n"
            "2. Use the most relevant table(s).\n"
            "3. Ensure the output SQL is executable and free of syntax errors.\n"
            "4. Always include LIMIT (max 100).\n"
            "5. Return ONLY the SQL query, nothing else.\n"
        )

        messages = [{"role": "system", "content": system_msg}]

        # Add few-shot examples
        for ex in self._sql_examples:
            messages.append({"role": "user", "content": ex["question"]})
            messages.append({"role": "assistant", "content": ex["sql"]})

        # Add the actual question
        messages.append({"role": "user", "content": question})

        return messages

    def _call_llm(self, messages: list[dict]) -> str:
        """Send prompt to OpenRouter and return SQL."""
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://wfx-ai-erp.vercel.app",
            "X-Title": "WFX AI ERP - Vanna NL2SQL",
        }

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.1,
            "max_tokens": 500,
        }

        try:
            response = httpx.post(
                self.api_url, json=payload, headers=headers, timeout=30.0
            )
            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.status_code}")
                return ""
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "").strip()
            return ""
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            return ""


# ── Singleton Instance ────────────────────────────────────────────────────────

_vanna_instance: Optional[VannaNL2SQL] = None


def get_vanna() -> VannaNL2SQL:
    """Get or create the Vanna NL2SQL instance with pre-trained schema."""
    global _vanna_instance
    if _vanna_instance is None:
        _vanna_instance = VannaNL2SQL()
        _train_vanna(_vanna_instance)
    return _vanna_instance


def _train_vanna(vn: VannaNL2SQL):
    """Train with ERP schema, documentation, and example queries."""
    logger.info("Training Vanna NL2SQL with ERP schema...")

    # DDL Training
    vn.add_ddl("CREATE TABLE buyers (id SERIAL PRIMARY KEY, company_name VARCHAR(255) UNIQUE, country VARCHAR(100), buyer_category VARCHAR(100), contact_person VARCHAR(255), email VARCHAR(255), phone VARCHAR(50), city VARCHAR(100), payment_terms VARCHAR(100), credit_limit DECIMAL(12,2));")
    vn.add_ddl("CREATE TABLE suppliers (id SERIAL PRIMARY KEY, company_name VARCHAR(255) UNIQUE, country VARCHAR(100), contact_person VARCHAR(255), lead_time_days INTEGER, rating DECIMAL(3,2), specialization VARCHAR(255), city VARCHAR(100));")
    vn.add_ddl("CREATE TABLE finished_goods (id SERIAL PRIMARY KEY, style_number VARCHAR(50) UNIQUE, style_name TEXT, category VARCHAR(100), fabric VARCHAR(255), gsm INTEGER, color VARCHAR(100), print VARCHAR(100), season VARCHAR(100), brand VARCHAR(100), supplier VARCHAR(255) REFERENCES suppliers(company_name), cost DECIMAL(10,2), selling_price DECIMAL(10,2), image_url TEXT, size_range VARCHAR(100), status VARCHAR(50));")
    vn.add_ddl("CREATE TABLE sales_orders (id SERIAL PRIMARY KEY, order_number VARCHAR(50) UNIQUE, buyer VARCHAR(255) REFERENCES buyers(company_name), style_number VARCHAR(50) REFERENCES finished_goods(style_number), quantity INTEGER, unit_price DECIMAL(10,2), total_amount DECIMAL(12,2), order_date DATE, shipment_date DATE, status VARCHAR(50));")
    vn.add_ddl("CREATE TABLE sales_invoices (id SERIAL PRIMARY KEY, invoice_number VARCHAR(50) UNIQUE, sales_order VARCHAR(50) REFERENCES sales_orders(order_number), buyer VARCHAR(255) REFERENCES buyers(company_name), amount DECIMAL(12,2), currency VARCHAR(10), tax DECIMAL(10,2), total DECIMAL(12,2), invoice_date DATE, due_date DATE, payment_status VARCHAR(50));")
    vn.add_ddl("CREATE TABLE tech_packs (id SERIAL PRIMARY KEY, style_number VARCHAR(50) REFERENCES finished_goods(style_number), fabric_details TEXT, construction TEXT, wash_instructions TEXT, measurements TEXT, status VARCHAR(50));")

    # Documentation
    vn.add_documentation("This is an ERP database for a global apparel sourcing company. GSM = Grams per Square Meter (fabric weight). Style Number = unique product ID. Tech Pack = manufacturing specification. Relationships: finished_goods.supplier -> suppliers.company_name, sales_orders.buyer -> buyers.company_name, sales_orders.style_number -> finished_goods.style_number, sales_invoices.sales_order -> sales_orders.order_number, tech_packs.style_number -> finished_goods.style_number.")

    # SQL Examples
    examples = [
        ("Which buyer generated the highest revenue?", "SELECT buyer, SUM(total_amount) AS revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 10"),
        ("Show me all cotton shirts", "SELECT * FROM finished_goods WHERE fabric ILIKE '%cotton%' AND category ILIKE '%shirt%' LIMIT 50"),
        ("Which supplier has the highest average order value?", "SELECT fg.supplier, AVG(so.total_amount) AS avg_order_value FROM sales_orders so JOIN finished_goods fg ON fg.style_number = so.style_number GROUP BY fg.supplier ORDER BY avg_order_value DESC LIMIT 10"),
        ("Show all black hoodies under 900", "SELECT * FROM finished_goods WHERE color ILIKE '%black%' AND style_name ILIKE '%hoodie%' AND selling_price < 900 LIMIT 50"),
        ("Which buyers purchased garments above 220 GSM?", "SELECT DISTINCT so.buyer, fg.style_name, fg.gsm FROM sales_orders so JOIN finished_goods fg ON fg.style_number = so.style_number WHERE fg.gsm > 220 LIMIT 50"),
        ("Show pending invoices above 1000", "SELECT * FROM sales_invoices WHERE payment_status = 'pending' AND total > 1000 ORDER BY total DESC LIMIT 50"),
        ("How many products are in each category?", "SELECT category, COUNT(*) AS count FROM finished_goods GROUP BY category ORDER BY count DESC"),
        ("What is the most popular fabric type?", "SELECT fabric, COUNT(*) AS count FROM finished_goods GROUP BY fabric ORDER BY count DESC LIMIT 10"),
        ("Show me all orders with status pending", "SELECT order_number, buyer, style_number, quantity, total_amount, order_date, shipment_date FROM sales_orders WHERE status = 'pending' ORDER BY order_date DESC LIMIT 50"),
        ("Which supplier supplied the most denim products?", "SELECT supplier, COUNT(*) AS product_count FROM finished_goods WHERE fabric ILIKE '%denim%' GROUP BY supplier ORDER BY product_count DESC LIMIT 10"),
    ]
    for q, sql in examples:
        vn.add_question_sql(q, sql)

    logger.info(f"Vanna trained: {len(vn._ddl_statements)} DDLs, {len(vn._sql_examples)} examples")
