"""
Vanna AI NL2SQL Service — uses Vanna framework with OpenRouter LLM backend.

Vanna is an open-source RAG framework for NL2SQL that:
- Trains on your schema + sample queries for better accuracy
- Uses RAG (Retrieval-Augmented Generation) for context
- Supports custom LLM backends (we use OpenRouter)

Reference: https://vanna.ai/docs
"""

import httpx
import logging
from typing import Optional
from vanna.base import VannaBase
from app.config import get_settings

logger = logging.getLogger(__name__)


class VannaOpenRouter(VannaBase):
    """
    Custom Vanna implementation using OpenRouter as the LLM backend.
    This connects Vanna's NL2SQL framework with OpenRouter's model API.
    """

    def __init__(self, config=None):
        super().__init__(config=config)
        settings = get_settings()
        self.api_key = settings.openrouter_api_key
        self.model = settings.openrouter_model
        self.api_url = "https://openrouter.ai/api/v1/chat/completions"

        # In-memory training data store (lightweight, no vector DB needed)
        self._ddl_statements: list[str] = []
        self._documentation: list[str] = []
        self._sql_examples: list[dict] = []

    def system_message(self, message: str) -> dict:
        return {"role": "system", "content": message}

    def user_message(self, message: str) -> dict:
        return {"role": "user", "content": message}

    def assistant_message(self, message: str) -> dict:
        return {"role": "assistant", "content": message}

    def submit_prompt(self, prompt: list[dict], **kwargs) -> str:
        """Send prompt to OpenRouter and return the LLM response."""
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
            "messages": prompt,
            "temperature": 0.1,
            "max_tokens": 1000,
        }

        try:
            response = httpx.post(
                self.api_url,
                json=payload,
                headers=headers,
                timeout=30.0,
            )

            if response.status_code != 200:
                logger.error(f"OpenRouter error: {response.status_code} - {response.text[:200]}")
                return ""

            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "").strip()
            return ""

        except Exception as e:
            logger.error(f"Vanna LLM call failed: {e}")
            return ""

    # ── Training Data Storage (in-memory) ─────────────────────────────────

    def add_ddl(self, ddl: str, **kwargs) -> str:
        """Store DDL for schema context."""
        self._ddl_statements.append(ddl)
        return f"DDL added (total: {len(self._ddl_statements)})"

    def add_documentation(self, documentation: str, **kwargs) -> str:
        """Store documentation for context."""
        self._documentation.append(documentation)
        return f"Documentation added (total: {len(self._documentation)})"

    def add_question_sql(self, question: str, sql: str, **kwargs) -> str:
        """Store question-SQL pair for few-shot examples."""
        self._sql_examples.append({"question": question, "sql": sql})
        return f"Example added (total: {len(self._sql_examples)})"

    def get_related_ddl(self, question: str, **kwargs) -> list[str]:
        """Return all DDL statements (small schema, return all)."""
        return self._ddl_statements

    def get_related_documentation(self, question: str, **kwargs) -> list[str]:
        """Return all documentation."""
        return self._documentation

    def get_similar_question_sql(self, question: str, **kwargs) -> list[dict]:
        """Return all stored SQL examples as few-shot context."""
        return self._sql_examples

    def get_training_data(self, **kwargs):
        """Return all training data."""
        return {
            "ddl": self._ddl_statements,
            "documentation": self._documentation,
            "sql_examples": self._sql_examples,
        }

    def remove_training_data(self, id: str, **kwargs) -> bool:
        """Not implemented for in-memory store."""
        return True

    def generate_embedding(self, data: str, **kwargs) -> list[float]:
        """Not using embeddings — return empty list. We use in-memory match."""
        return []


# ── Singleton Instance ────────────────────────────────────────────────────────

_vanna_instance: Optional[VannaOpenRouter] = None


def get_vanna() -> VannaOpenRouter:
    """Get or create the Vanna AI instance with pre-trained schema context."""
    global _vanna_instance
    if _vanna_instance is None:
        _vanna_instance = VannaOpenRouter()
        _train_vanna(_vanna_instance)
    return _vanna_instance


def _train_vanna(vn: VannaOpenRouter):
    """
    Train Vanna with our ERP schema, documentation, and example queries.
    This runs once at startup and provides context for all NL2SQL queries.
    """
    logger.info("Training Vanna AI with ERP schema context...")

    # ── DDL Training (Schema) ─────────────────────────────────────────────
    vn.add_ddl("""
    CREATE TABLE buyers (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL UNIQUE,
        country VARCHAR(100),
        buyer_category VARCHAR(100),
        contact_person VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        city VARCHAR(100),
        payment_terms VARCHAR(100),
        credit_limit DECIMAL(12, 2)
    );
    """)

    vn.add_ddl("""
    CREATE TABLE suppliers (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL UNIQUE,
        country VARCHAR(100),
        contact_person VARCHAR(255),
        lead_time_days INTEGER,
        rating DECIMAL(3, 2),
        specialization VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        city VARCHAR(100),
        status VARCHAR(50)
    );
    """)

    vn.add_ddl("""
    CREATE TABLE finished_goods (
        id SERIAL PRIMARY KEY,
        style_number VARCHAR(50) NOT NULL UNIQUE,
        style_name TEXT,
        category VARCHAR(100),
        fabric VARCHAR(255),
        gsm INTEGER,
        color VARCHAR(100),
        print VARCHAR(100),
        season VARCHAR(100),
        brand VARCHAR(100),
        supplier VARCHAR(255) REFERENCES suppliers(company_name),
        cost DECIMAL(10, 2),
        selling_price DECIMAL(10, 2),
        image_url TEXT,
        size_range VARCHAR(100),
        status VARCHAR(50)
    );
    """)

    vn.add_ddl("""
    CREATE TABLE sales_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) NOT NULL UNIQUE,
        buyer VARCHAR(255) REFERENCES buyers(company_name),
        style_number VARCHAR(50) REFERENCES finished_goods(style_number),
        quantity INTEGER,
        unit_price DECIMAL(10, 2),
        total_amount DECIMAL(12, 2),
        order_date DATE,
        shipment_date DATE,
        status VARCHAR(50)
    );
    """)

    vn.add_ddl("""
    CREATE TABLE sales_invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR(50) NOT NULL UNIQUE,
        sales_order VARCHAR(50) REFERENCES sales_orders(order_number),
        buyer VARCHAR(255) REFERENCES buyers(company_name),
        amount DECIMAL(12, 2),
        currency VARCHAR(10),
        tax DECIMAL(10, 2),
        total DECIMAL(12, 2),
        invoice_date DATE,
        due_date DATE,
        payment_status VARCHAR(50)
    );
    """)

    vn.add_ddl("""
    CREATE TABLE tech_packs (
        id SERIAL PRIMARY KEY,
        style_number VARCHAR(50) REFERENCES finished_goods(style_number),
        fabric_details TEXT,
        construction TEXT,
        wash_instructions TEXT,
        measurements TEXT,
        status VARCHAR(50)
    );
    """)

    # ── Documentation Training ────────────────────────────────────────────
    vn.add_documentation("""
    This is an ERP database for a global apparel sourcing company.
    It manages finished goods (garments), suppliers, buyers, sales orders,
    invoices, and technical packs for the fashion industry.

    Key relationships:
    - finished_goods.supplier references suppliers.company_name
    - sales_orders.buyer references buyers.company_name
    - sales_orders.style_number references finished_goods.style_number
    - sales_invoices.sales_order references sales_orders.order_number
    - tech_packs.style_number references finished_goods.style_number

    Common business terms:
    - GSM = Grams per Square Meter (fabric weight)
    - Style Number = unique product identifier
    - Tech Pack = technical specification document for manufacturing
    - FOB = Free on Board (shipping term)
    - MOQ = Minimum Order Quantity
    """)

    # ── SQL Examples Training ─────────────────────────────────────────────
    examples = [
        ("Which buyer generated the highest revenue?",
         "SELECT buyer, SUM(total_amount) AS revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 10"),
        ("Show me all cotton shirts supplied by Textile Corp",
         "SELECT * FROM finished_goods WHERE fabric ILIKE '%cotton%' AND category ILIKE '%shirt%' AND supplier = 'Textile Corp' LIMIT 50"),
        ("Which supplier has the highest average order value?",
         "SELECT fg.supplier, AVG(so.total_amount) AS avg_order_value FROM sales_orders so JOIN finished_goods fg ON fg.style_number = so.style_number GROUP BY fg.supplier ORDER BY avg_order_value DESC LIMIT 10"),
        ("Show all black hoodies under 900",
         "SELECT * FROM finished_goods WHERE color ILIKE '%black%' AND style_name ILIKE '%hoodie%' AND selling_price < 900 LIMIT 50"),
        ("Which buyers purchased garments above 220 GSM?",
         "SELECT DISTINCT so.buyer, fg.style_name, fg.gsm FROM sales_orders so JOIN finished_goods fg ON fg.style_number = so.style_number WHERE fg.gsm > 220 LIMIT 50"),
        ("Show pending invoices above 1000",
         "SELECT * FROM sales_invoices WHERE payment_status = 'pending' AND total > 1000 ORDER BY total DESC LIMIT 50"),
        ("How many products are in each category?",
         "SELECT category, COUNT(*) AS count FROM finished_goods GROUP BY category ORDER BY count DESC"),
        ("What is the most popular fabric type?",
         "SELECT fabric, COUNT(*) AS count FROM finished_goods GROUP BY fabric ORDER BY count DESC LIMIT 10"),
        ("Show me all orders with status pending",
         "SELECT order_number, buyer, style_number, quantity, total_amount, order_date, shipment_date FROM sales_orders WHERE status = 'pending' ORDER BY order_date DESC LIMIT 50"),
        ("Which supplier supplied the most denim products?",
         "SELECT supplier, COUNT(*) AS product_count FROM finished_goods WHERE fabric ILIKE '%denim%' GROUP BY supplier ORDER BY product_count DESC LIMIT 10"),
    ]

    for question, sql in examples:
        vn.add_question_sql(question=question, sql=sql)

    logger.info(f"Vanna AI trained: {len(vn._ddl_statements)} DDLs, {len(vn._documentation)} docs, {len(vn._sql_examples)} examples")
