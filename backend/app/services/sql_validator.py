"""
SQL Validator — enforces safety rules on LLM-generated SQL.

Rules:
  1. Only SELECT statements allowed
  2. Block all DDL/DML keywords
  3. Only allow queries against known ERP tables
  4. Auto-add LIMIT if missing
  5. Block multiple statements
  6. Block system table access
"""

import re
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

# ── Allowed tables (only these can be queried) ────────────────────────────────
ALLOWED_TABLES = {
    "buyers",
    "suppliers",
    "finished_goods",
    "sales_orders",
    "sales_invoices",
    "tech_packs",
}

# ── Blocked keywords (DDL/DML operations) ─────────────────────────────────────
BLOCKED_KEYWORDS = [
    r"\bINSERT\b",
    r"\bUPDATE\b",
    r"\bDELETE\b",
    r"\bDROP\b",
    r"\bALTER\b",
    r"\bTRUNCATE\b",
    r"\bCREATE\b",
    r"\bGRANT\b",
    r"\bREVOKE\b",
    r"\bEXEC\b",
    r"\bEXECUTE\b",
    r"\bCALL\b",
    r"\bCOPY\b",
    r"\bPG_SLEEP\b",
    r"\bINTO\s+OUTFILE\b",
    r"\bINTO\s+DUMPFILE\b",
    r"\bLOAD_FILE\b",
]

# ── Blocked patterns (system access, comments, multi-statement) ───────────────
BLOCKED_PATTERNS = [
    r"pg_catalog",
    r"information_schema",
    r"pg_tables",
    r"pg_proc",
    r"pg_class",
    r"pg_namespace",
    r"pg_stat",
    r"--",              # SQL line comments
    r"/\*",            # Block comments open
    r"\*/",            # Block comments close
    r"\\\\",           # Backslash escape attempts
]

# Default LIMIT to add if missing
DEFAULT_LIMIT = 100


def validate_sql(sql: str) -> Tuple[bool, str, str]:
    """
    Validate a SQL query for safety.

    Args:
        sql: The raw SQL string from the LLM

    Returns:
        Tuple of (is_valid, cleaned_sql, error_message)
        - is_valid: True if the query passes all safety checks
        - cleaned_sql: The sanitized SQL (with LIMIT added if needed)
        - error_message: Description of why validation failed (empty if valid)
    """
    if not sql or not sql.strip():
        return False, "", "Empty query received."

    # Clean up the SQL
    cleaned = _clean_sql(sql)

    if not cleaned:
        return False, "", "Query is empty after cleanup."

    # ── Check 1: Must start with SELECT ──────────────────────────
    if not cleaned.upper().lstrip().startswith("SELECT"):
        return False, "", "Only SELECT queries are allowed. The query must start with SELECT."

    # ── Check 2: Block multiple statements ───────────────────────
    # Split by semicolons, filter empty — should be exactly 1 statement
    statements = [s.strip() for s in cleaned.split(";") if s.strip()]
    if len(statements) > 1:
        return False, "", "Multiple SQL statements are not allowed. Please ask one question at a time."

    # ── Check 3: Check for blocked keywords ──────────────────────
    upper_sql = cleaned.upper()
    for pattern in BLOCKED_KEYWORDS:
        if re.search(pattern, upper_sql, re.IGNORECASE):
            keyword = re.search(pattern, upper_sql, re.IGNORECASE).group()
            return False, "", f"Unsafe operation detected: {keyword}. Only SELECT queries are allowed."

    # ── Check 4: Check for blocked patterns ──────────────────────
    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return False, "", f"Unsafe pattern detected in query. Access to system tables or comments is not allowed."

    # ── Check 5: Verify only allowed tables are referenced ───────
    table_check = _check_tables(cleaned)
    if not table_check[0]:
        return False, "", table_check[1]

    # ── Check 6: Add LIMIT if missing ────────────────────────────
    cleaned = _ensure_limit(cleaned)

    return True, cleaned, ""


def _clean_sql(sql: str) -> str:
    """
    Clean and normalize raw SQL from LLM output.
    Removes markdown code blocks, extra whitespace, and trailing semicolons.
    """
    # Remove markdown code fences (line-based approach is most reliable)
    lines = sql.strip().splitlines()

    # If first line is a code fence (```sql or ```), remove it
    if lines and lines[0].strip().startswith("```"):
        lines = lines[1:]
    # If last line is a code fence, remove it
    if lines and lines[-1].strip().startswith("```"):
        lines = lines[:-1]

    sql = "\n".join(lines).strip()

    # Remove trailing semicolons
    sql = sql.rstrip(";").strip()

    # Normalize whitespace (collapse multiple spaces/newlines)
    sql = re.sub(r"\s+", " ", sql)

    return sql


def _check_tables(sql: str) -> Tuple[bool, str]:
    """
    Verify that only allowed tables are referenced in the query.
    Uses regex to find FROM and JOIN table references.
    """
    # Extract table names from FROM and JOIN clauses
    # Matches: FROM table_name, JOIN table_name, from table_name as alias
    table_pattern = r"(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)"
    found_tables = re.findall(table_pattern, sql, re.IGNORECASE)

    # Check each found table against allowlist
    for table in found_tables:
        table_lower = table.lower()
        if table_lower not in ALLOWED_TABLES:
            return False, (
                f"Table '{table}' is not recognized. "
                f"Allowed tables: {', '.join(sorted(ALLOWED_TABLES))}"
            )

    return True, ""


def _ensure_limit(sql: str) -> str:
    """
    Add a LIMIT clause if one is not present.
    Prevents unbounded result sets that could exhaust memory.
    """
    if not re.search(r"\bLIMIT\b", sql, re.IGNORECASE):
        sql = f"{sql} LIMIT {DEFAULT_LIMIT}"
    return sql
