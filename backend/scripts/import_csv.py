"""
WFX AI ERP — CSV Data Import Script

Imports CSV files into Supabase PostgreSQL tables.
Handles foreign key ordering automatically:
  1. buyers (no FK dependencies)
  2. suppliers (no FK dependencies)
  3. finished_goods (depends on suppliers)
  4. sales_orders (depends on buyers, finished_goods)
  5. sales_invoices (depends on sales_orders, buyers)
  6. tech_packs (depends on finished_goods)

Usage:
    cd backend
    cp .env.example .env  # fill in real credentials
    python scripts/import_csv.py --data-dir ../data

    Or specify individual files:
    python scripts/import_csv.py --data-dir ../data --tables buyers suppliers
"""

import os
import sys
import argparse
import logging
from pathlib import Path

import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# ── Setup ─────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# Load env from backend/.env
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)

# ── Table Definitions ─────────────────────────────────────────────────────────
# Maps table name → expected CSV filename and column mappings
TABLE_CONFIG = {
    "buyers": {
        "csv_file": "buyers.csv",
        "columns": [
            "company_name", "contact_person", "email", "phone",
            "country", "city", "address", "payment_terms",
            "credit_limit", "status"
        ],
    },
    "suppliers": {
        "csv_file": "suppliers.csv",
        "columns": [
            "company_name", "contact_person", "email", "phone",
            "country", "city", "specialization", "lead_time_days",
            "rating", "status"
        ],
    },
    "finished_goods": {
        "csv_file": "finished_goods.csv",
        "columns": [
            "style_number", "description", "category", "supplier",
            "fabric", "color", "size_range", "season", "price",
            "status", "image_url"
        ],
    },
    "sales_orders": {
        "csv_file": "sales_orders.csv",
        "columns": [
            "order_number", "buyer", "style_number", "quantity",
            "unit_price", "total_amount", "order_date", "delivery_date",
            "status"
        ],
    },
    "sales_invoices": {
        "csv_file": "sales_invoices.csv",
        "columns": [
            "invoice_number", "sales_order", "buyer", "amount",
            "tax", "total", "invoice_date", "due_date", "payment_status"
        ],
    },
    "tech_packs": {
        "csv_file": "tech_packs.csv",
        "columns": [
            "style_number", "description", "fabric_details",
            "measurements", "construction_notes", "status"
        ],
    },
}

# Insertion order respects foreign key dependencies
INSERTION_ORDER = [
    "buyers",
    "suppliers",
    "finished_goods",
    "sales_orders",
    "sales_invoices",
    "tech_packs",
]


def get_connection():
    """Create a psycopg2 connection using DATABASE_URL."""
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        logger.error("DATABASE_URL is not set. Check your .env file.")
        sys.exit(1)

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = False
        logger.info("Connected to database successfully.")
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        sys.exit(1)


def clean_dataframe(df: pd.DataFrame, expected_columns: list[str]) -> pd.DataFrame:
    """
    Clean and normalize a DataFrame to match expected columns.
    - Strips whitespace from column names
    - Converts column names to snake_case
    - Fills NaN with None (for SQL NULL)
    - Only keeps columns that exist in the expected list
    """
    # Normalize column names: strip, lowercase, replace spaces with underscores
    df.columns = [col.strip().lower().replace(" ", "_").replace("-", "_") for col in df.columns]

    # Only keep columns that match expected schema
    available_cols = [col for col in expected_columns if col in df.columns]
    missing_cols = [col for col in expected_columns if col not in df.columns]

    if missing_cols:
        logger.warning(f"  Missing columns (will be NULL): {missing_cols}")

    df = df[available_cols].copy()

    # Add missing columns as None
    for col in missing_cols:
        df[col] = None

    # Reorder to match expected
    df = df[expected_columns]

    # Replace NaN with None
    df = df.where(pd.notnull(df), None)

    return df


def import_table(conn, table_name: str, data_dir: Path, truncate: bool = False):
    """Import a single CSV file into the corresponding database table."""
    config = TABLE_CONFIG[table_name]
    csv_path = data_dir / config["csv_file"]

    if not csv_path.exists():
        logger.warning(f"  Skipping {table_name}: CSV file not found at {csv_path}")
        return 0

    logger.info(f"  Reading {csv_path.name}...")
    df = pd.read_csv(csv_path, encoding="utf-8")
    logger.info(f"  Found {len(df)} rows in CSV")

    # Clean and normalize
    df = clean_dataframe(df, config["columns"])

    if df.empty:
        logger.warning(f"  No data to import for {table_name}")
        return 0

    cursor = conn.cursor()

    try:
        if truncate:
            cursor.execute(f"TRUNCATE TABLE {table_name} CASCADE;")
            logger.info(f"  Truncated table {table_name}")

        # Build INSERT query with ON CONFLICT DO NOTHING for idempotent imports
        columns = config["columns"]
        col_list = ", ".join(columns)
        placeholders = ", ".join(["%s"] * len(columns))

        insert_sql = f"""
            INSERT INTO {table_name} ({col_list})
            VALUES %s
            ON CONFLICT DO NOTHING;
        """

        # Convert DataFrame to list of tuples
        records = [tuple(row) for row in df.values.tolist()]

        # Batch insert using execute_values for performance
        execute_values(
            cursor,
            f"INSERT INTO {table_name} ({col_list}) VALUES %s ON CONFLICT DO NOTHING",
            records,
            page_size=500,
        )

        conn.commit()
        logger.info(f"  ✓ Imported {len(records)} rows into {table_name}")
        return len(records)

    except Exception as e:
        conn.rollback()
        logger.error(f"  ✗ Failed to import {table_name}: {e}")
        return 0
    finally:
        cursor.close()


def run_schema(conn, schema_dir: Path):
    """Optionally run schema.sql and indexes.sql before import."""
    schema_file = schema_dir / "schema.sql"
    indexes_file = schema_dir / "indexes.sql"

    cursor = conn.cursor()

    if schema_file.exists():
        logger.info("Running schema.sql...")
        cursor.execute(schema_file.read_text(encoding="utf-8"))
        conn.commit()
        logger.info("  ✓ Schema created")

    if indexes_file.exists():
        logger.info("Running indexes.sql...")
        cursor.execute(indexes_file.read_text(encoding="utf-8"))
        conn.commit()
        logger.info("  ✓ Indexes created")

    cursor.close()


def main():
    parser = argparse.ArgumentParser(description="Import CSV data into WFX AI ERP database")
    parser.add_argument(
        "--data-dir",
        type=str,
        default="../data",
        help="Directory containing CSV files (default: ../data)",
    )
    parser.add_argument(
        "--tables",
        nargs="*",
        default=None,
        help="Specific tables to import (default: all)",
    )
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Truncate tables before import (WARNING: deletes existing data)",
    )
    parser.add_argument(
        "--run-schema",
        action="store_true",
        help="Run schema.sql and indexes.sql before importing",
    )

    args = parser.parse_args()
    data_dir = Path(args.data_dir).resolve()

    logger.info(f"Data directory: {data_dir}")
    logger.info(f"CSV files expected: {[TABLE_CONFIG[t]['csv_file'] for t in INSERTION_ORDER]}")

    if not data_dir.exists():
        logger.error(f"Data directory does not exist: {data_dir}")
        logger.info("Create it and add your CSV files, or specify --data-dir")
        sys.exit(1)

    # Connect to database
    conn = get_connection()

    # Optionally run schema
    if args.run_schema:
        schema_dir = Path(__file__).resolve().parent.parent.parent / "database"
        run_schema(conn, schema_dir)

    # Determine which tables to import
    tables_to_import = args.tables if args.tables else INSERTION_ORDER

    # Validate table names
    for table in tables_to_import:
        if table not in TABLE_CONFIG:
            logger.error(f"Unknown table: {table}")
            logger.info(f"Available tables: {list(TABLE_CONFIG.keys())}")
            sys.exit(1)

    # Import in correct order
    logger.info("=" * 60)
    logger.info("Starting CSV import...")
    logger.info("=" * 60)

    total_imported = 0
    for table in INSERTION_ORDER:
        if table in tables_to_import:
            logger.info(f"\n[{table}]")
            count = import_table(conn, table, data_dir, truncate=args.truncate)
            total_imported += count

    logger.info("\n" + "=" * 60)
    logger.info(f"Import complete. Total rows imported: {total_imported}")
    logger.info("=" * 60)

    conn.close()


if __name__ == "__main__":
    main()
