"""
Product service — handles all product-related database queries.
Supports listing, search, filtering, pagination, and sorting.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import logging
import math

logger = logging.getLogger(__name__)

# Allowed sort columns to prevent SQL injection via sort_by parameter
ALLOWED_SORT_COLUMNS = {
    "style_number", "style_name", "category", "supplier",
    "fabric", "color", "season", "selling_price", "status",
    "gsm", "print", "brand", "cost",
}

DEFAULT_SORT = "style_number"
DEFAULT_ORDER = "asc"


async def list_products(
    db: AsyncSession,
    page: int = 1,
    limit: int = 20,
    sort_by: str = DEFAULT_SORT,
    sort_order: str = DEFAULT_ORDER,
    category: Optional[str] = None,
    fabric: Optional[str] = None,
    supplier: Optional[str] = None,
    color: Optional[str] = None,
    season: Optional[str] = None,
    status: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> dict:
    """
    List products with filtering, pagination, and sorting.
    Returns paginated results with total count.
    """
    # Validate sort column
    if sort_by not in ALLOWED_SORT_COLUMNS:
        sort_by = DEFAULT_SORT
    if sort_order.lower() not in ("asc", "desc"):
        sort_order = DEFAULT_ORDER

    # Build WHERE clauses dynamically
    conditions = []
    params = {}

    if category:
        conditions.append("category = :category")
        params["category"] = category
    if fabric:
        conditions.append("fabric = :fabric")
        params["fabric"] = fabric
    if supplier:
        conditions.append("supplier = :supplier")
        params["supplier"] = supplier
    if color:
        conditions.append("color = :color")
        params["color"] = color
    if season:
        conditions.append("season = :season")
        params["season"] = season
    if status:
        conditions.append("status = :status")
        params["status"] = status
    if min_price is not None:
        conditions.append("selling_price >= :min_price")
        params["min_price"] = min_price
    if max_price is not None:
        conditions.append("selling_price <= :max_price")
        params["max_price"] = max_price

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # Count total for pagination
    count_sql = f"SELECT COUNT(*)::int AS total FROM finished_goods {where_clause}"
    count_result = await db.execute(text(count_sql), params)
    total = count_result.scalar()

    # Calculate offset
    offset = (page - 1) * limit
    total_pages = math.ceil(total / limit) if total > 0 else 1

    # Fetch paginated results
    query_sql = f"""
        SELECT id, style_number, style_name, category, supplier,
               fabric, color, size_range, season, selling_price, status, image_url,
               gsm, print, brand, cost
        FROM finished_goods
        {where_clause}
        ORDER BY {sort_by} {sort_order}
        LIMIT {limit} OFFSET {offset}
    """

    result = await db.execute(text(query_sql), params)
    products = [dict(row) for row in result.mappings().all()]

    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


async def get_product_by_style(db: AsyncSession, style_number: str) -> Optional[dict]:
    """
    Fetch a single product by its style_number.
    Returns None if not found.
    """
    result = await db.execute(
        text("""
            SELECT id, style_number, style_name, category, supplier,
                   fabric, color, size_range, season, selling_price, status, image_url,
                   style_name, gsm, print, brand, cost
            FROM finished_goods
            WHERE style_number = :style_number
        """),
        {"style_number": style_number},
    )
    row = result.mappings().one_or_none()
    return dict(row) if row else None


async def search_products(
    db: AsyncSession,
    q: str = "",
    page: int = 1,
    limit: int = 20,
    category: Optional[str] = None,
    fabric: Optional[str] = None,
    supplier: Optional[str] = None,
    color: Optional[str] = None,
    season: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
) -> dict:
    """
    Search products by keyword across description, category, fabric, color, supplier.
    Also supports additional filter criteria.
    """
    conditions = []
    params = {}

    # Keyword search using ILIKE across multiple columns
    if q:
        conditions.append("""(
            style_name ILIKE :q OR
            category ILIKE :q OR
            fabric ILIKE :q OR
            color ILIKE :q OR
            supplier ILIKE :q OR
            style_number ILIKE :q
        )""")
        params["q"] = f"%{q}%"

    # Additional filters
    if category:
        conditions.append("category = :category")
        params["category"] = category
    if fabric:
        conditions.append("fabric = :fabric")
        params["fabric"] = fabric
    if supplier:
        conditions.append("supplier = :supplier")
        params["supplier"] = supplier
    if color:
        conditions.append("color = :color")
        params["color"] = color
    if season:
        conditions.append("season = :season")
        params["season"] = season
    if min_price is not None:
        conditions.append("selling_price >= :min_price")
        params["min_price"] = min_price
    if max_price is not None:
        conditions.append("selling_price <= :max_price")
        params["max_price"] = max_price

    where_clause = ""
    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # Count
    count_sql = f"SELECT COUNT(*)::int AS total FROM finished_goods {where_clause}"
    count_result = await db.execute(text(count_sql), params)
    total = count_result.scalar()

    # Paginate
    offset = (page - 1) * limit
    total_pages = math.ceil(total / limit) if total > 0 else 1

    query_sql = f"""
        SELECT id, style_number, style_name, category, supplier,
               fabric, color, size_range, season, selling_price, status, image_url,
               gsm, print, brand, cost
        FROM finished_goods
        {where_clause}
        ORDER BY selling_price ASC
        LIMIT {limit} OFFSET {offset}
    """

    result = await db.execute(text(query_sql), params)
    products = [dict(row) for row in result.mappings().all()]

    return {
        "products": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": total_pages,
    }


async def get_filter_options(db: AsyncSession) -> dict:
    """
    Get all distinct filter values for the product search UI.
    Returns categories, fabrics, suppliers, colors, seasons, and price range.
    """
    result = await db.execute(text("""
        SELECT
            ARRAY_AGG(DISTINCT category ORDER BY category)
                FILTER (WHERE category IS NOT NULL) AS categories,
            ARRAY_AGG(DISTINCT fabric ORDER BY fabric)
                FILTER (WHERE fabric IS NOT NULL) AS fabrics,
            ARRAY_AGG(DISTINCT supplier ORDER BY supplier)
                FILTER (WHERE supplier IS NOT NULL) AS suppliers,
            ARRAY_AGG(DISTINCT color ORDER BY color)
                FILTER (WHERE color IS NOT NULL) AS colors,
            ARRAY_AGG(DISTINCT season ORDER BY season)
                FILTER (WHERE season IS NOT NULL) AS seasons,
            COALESCE(MIN(selling_price), 0)::float AS price_min,
            COALESCE(MAX(selling_price), 0)::float AS price_max
        FROM finished_goods
    """))
    row = result.mappings().one()
    return {
        "categories": row["categories"] or [],
        "fabrics": row["fabrics"] or [],
        "suppliers": row["suppliers"] or [],
        "colors": row["colors"] or [],
        "seasons": row["seasons"] or [],
        "price_min": row["price_min"],
        "price_max": row["price_max"],
    }
