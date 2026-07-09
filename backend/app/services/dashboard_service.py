"""
Dashboard service — all database queries for analytics endpoints.
Keeps SQL out of route handlers for cleaner separation of concerns.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import logging

logger = logging.getLogger(__name__)


async def get_stats(db: AsyncSession) -> dict:
    """
    Fetch all KPI stats in a single efficient query block.
    Returns totals for products, buyers, suppliers, orders, revenue,
    pending invoices, top buyer, and top supplier.
    """
    try:
        result = await db.execute(text("""
            SELECT
                (SELECT COUNT(*)::int FROM finished_goods)            AS total_products,
                (SELECT COUNT(*)::int FROM buyers)                    AS total_buyers,
                (SELECT COUNT(*)::int FROM suppliers)                 AS total_suppliers,
                (SELECT COUNT(*)::int FROM sales_orders)              AS total_orders,
                (SELECT COALESCE(SUM(total_amount), 0) FROM sales_orders)::float
                                                                      AS total_revenue,
                (SELECT COUNT(*)::int FROM sales_invoices
                 WHERE payment_status IN ('pending', 'overdue'))      AS pending_invoices,
                (SELECT buyer FROM sales_orders
                 GROUP BY buyer ORDER BY SUM(total_amount) DESC
                 LIMIT 1)                                             AS top_buyer,
                (SELECT supplier FROM finished_goods
                 GROUP BY supplier ORDER BY COUNT(*) DESC
                 LIMIT 1)                                             AS top_supplier
        """))
        row = result.mappings().one()
        return dict(row)
    except Exception as e:
        logger.error(f"get_stats error: {e}")
        raise


async def get_revenue_by_buyer(db: AsyncSession, limit: int = 10) -> list[dict]:
    """
    Revenue breakdown by buyer — used for bar chart on dashboard.
    Returns buyer name, total revenue, and order count.
    """
    try:
        result = await db.execute(text("""
            SELECT
                buyer,
                ROUND(SUM(total_amount)::numeric, 2)::float AS revenue,
                COUNT(*)::int                                AS order_count
            FROM sales_orders
            WHERE buyer IS NOT NULL
            GROUP BY buyer
            ORDER BY revenue DESC
            LIMIT :limit
        """), {"limit": limit})
        return [dict(row) for row in result.mappings().all()]
    except Exception as e:
        logger.error(f"get_revenue_by_buyer error: {e}")
        raise


async def get_orders_by_status(db: AsyncSession) -> list[dict]:
    """
    Order count grouped by status — used for pie/donut chart.
    """
    try:
        result = await db.execute(text("""
            SELECT
                COALESCE(status, 'unknown') AS status,
                COUNT(*)::int               AS count
            FROM sales_orders
            GROUP BY status
            ORDER BY count DESC
        """))
        return [dict(row) for row in result.mappings().all()]
    except Exception as e:
        logger.error(f"get_orders_by_status error: {e}")
        raise


async def get_products_by_category(db: AsyncSession) -> list[dict]:
    """
    Product count grouped by category — used for bar chart.
    """
    try:
        result = await db.execute(text("""
            SELECT
                COALESCE(category, 'Uncategorized') AS category,
                COUNT(*)::int                       AS count
            FROM finished_goods
            GROUP BY category
            ORDER BY count DESC
        """))
        return [dict(row) for row in result.mappings().all()]
    except Exception as e:
        logger.error(f"get_products_by_category error: {e}")
        raise


async def get_top_suppliers(db: AsyncSession, limit: int = 10) -> list[dict]:
    """
    Top suppliers by product count — used for horizontal bar chart.
    """
    try:
        result = await db.execute(text("""
            SELECT
                COALESCE(supplier, 'Unknown') AS supplier,
                COUNT(*)::int                 AS product_count
            FROM finished_goods
            WHERE supplier IS NOT NULL
            GROUP BY supplier
            ORDER BY product_count DESC
            LIMIT :limit
        """), {"limit": limit})
        return [dict(row) for row in result.mappings().all()]
    except Exception as e:
        logger.error(f"get_top_suppliers error: {e}")
        raise
