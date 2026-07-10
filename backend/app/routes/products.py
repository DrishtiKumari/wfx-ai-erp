"""
Product routes — endpoints for browsing, searching, and filtering products.
All endpoints are read-only and support pagination.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database import get_db
from app.schemas.products import ProductItem, ProductListResponse, ProductFilters
from app.services import product_service

router = APIRouter(prefix="/products", tags=["Products"])


@router.get(
    "/filters",
    response_model=ProductFilters,
    summary="Get available filter options",
)
async def get_filters(db: AsyncSession = Depends(get_db)):
    """
    Returns all distinct values for each filterable field.
    Used by the frontend to populate filter dropdowns/checkboxes.
    """
    try:
        return await product_service.get_filter_options(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/search",
    response_model=ProductListResponse,
    summary="Search products with keyword and filters",
)
async def search_products(
    q: str = Query(default="", description="Keyword search term"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    fabric: Optional[str] = Query(default=None, description="Filter by fabric"),
    supplier: Optional[str] = Query(default=None, description="Filter by supplier"),
    color: Optional[str] = Query(default=None, description="Filter by color"),
    season: Optional[str] = Query(default=None, description="Filter by season"),
    min_price: Optional[float] = Query(default=None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(default=None, ge=0, description="Maximum price"),
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    db: AsyncSession = Depends(get_db),
):
    """
    Search products by keyword across multiple fields (description, category,
    fabric, color, supplier, style number). Supports additional filters.
    Results are paginated and sorted by price ascending.
    """
    try:
        return await product_service.search_products(
            db,
            q=q,
            page=page,
            limit=limit,
            category=category,
            fabric=fabric,
            supplier=supplier,
            color=color,
            season=season,
            min_price=min_price,
            max_price=max_price,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{style_number}",
    response_model=ProductItem,
    summary="Get product details by style number",
)
async def get_product(style_number: str, db: AsyncSession = Depends(get_db)):
    """
    Fetch a single product's full details by its unique style number.
    Returns 404 if the product is not found.
    """
    product = await product_service.get_product_by_style(db, style_number)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product '{style_number}' not found")
    return product


@router.get(
    "",
    response_model=ProductListResponse,
    summary="List products with pagination and sorting",
)
async def list_products(
    page: int = Query(default=1, ge=1, description="Page number"),
    limit: int = Query(default=20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query(default="style_number", description="Column to sort by"),
    sort_order: str = Query(default="asc", pattern="^(asc|desc)$", description="Sort direction"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    fabric: Optional[str] = Query(default=None, description="Filter by fabric"),
    supplier: Optional[str] = Query(default=None, description="Filter by supplier"),
    color: Optional[str] = Query(default=None, description="Filter by color"),
    season: Optional[str] = Query(default=None, description="Filter by season"),
    status: Optional[str] = Query(default=None, description="Filter by status"),
    min_price: Optional[float] = Query(default=None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(default=None, ge=0, description="Maximum price"),
    db: AsyncSession = Depends(get_db),
):
    """
    List all products with optional filtering, pagination, and sorting.
    Supports filtering by category, fabric, supplier, color, season, status, and price range.
    """
    try:
        return await product_service.list_products(
            db,
            page=page,
            limit=limit,
            sort_by=sort_by,
            sort_order=sort_order,
            category=category,
            fabric=fabric,
            supplier=supplier,
            color=color,
            season=season,
            status=status,
            min_price=min_price,
            max_price=max_price,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
