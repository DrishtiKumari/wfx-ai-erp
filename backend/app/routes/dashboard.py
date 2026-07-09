"""
Dashboard routes — analytics endpoints for the ERP dashboard page.
All endpoints are read-only SELECT queries via the dashboard service.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.dashboard import (
    DashboardStats,
    RevenueBuyerItem,
    OrderStatusItem,
    ProductCategoryItem,
    TopSupplierItem,
)
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/stats",
    response_model=DashboardStats,
    summary="Overall KPI statistics",
)
async def get_stats(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregate KPI metrics for the dashboard header cards:
    - Total finished goods, buyers, suppliers, orders
    - Total revenue across all orders
    - Pending/overdue invoice count
    - Top buyer and top supplier by volume
    """
    try:
        return await dashboard_service.get_stats(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/revenue-by-buyer",
    response_model=List[RevenueBuyerItem],
    summary="Revenue breakdown by buyer",
)
async def get_revenue_by_buyer(
    limit: int = Query(default=10, ge=1, le=50, description="Max number of buyers to return"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns revenue totals grouped by buyer, sorted highest first.
    Used for the bar chart showing buyer performance.
    """
    try:
        return await dashboard_service.get_revenue_by_buyer(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/orders-by-status",
    response_model=List[OrderStatusItem],
    summary="Order count grouped by status",
)
async def get_orders_by_status(db: AsyncSession = Depends(get_db)):
    """
    Returns order counts for each status (completed, pending, shipped, cancelled).
    Used for the pie/donut chart showing order pipeline health.
    """
    try:
        return await dashboard_service.get_orders_by_status(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/products-by-category",
    response_model=List[ProductCategoryItem],
    summary="Product count grouped by category",
)
async def get_products_by_category(db: AsyncSession = Depends(get_db)):
    """
    Returns product counts per category (Tops, Dresses, Bottoms, Outerwear, etc.).
    Used for the category breakdown bar chart.
    """
    try:
        return await dashboard_service.get_products_by_category(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/top-suppliers",
    response_model=List[TopSupplierItem],
    summary="Top suppliers by product count",
)
async def get_top_suppliers(
    limit: int = Query(default=10, ge=1, le=50, description="Max number of suppliers to return"),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns top suppliers ranked by number of products they supply.
    Used for the horizontal bar chart showing supplier contribution.
    """
    try:
        return await dashboard_service.get_top_suppliers(db, limit=limit)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
