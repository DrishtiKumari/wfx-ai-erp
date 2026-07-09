"""
Pydantic response schemas for dashboard endpoints.
These define the exact shape of JSON returned to the frontend.
"""

from pydantic import BaseModel
from typing import Optional


class DashboardStats(BaseModel):
    total_products: int
    total_buyers: int
    total_suppliers: int
    total_orders: int
    total_revenue: float
    pending_invoices: int
    top_buyer: Optional[str] = None
    top_supplier: Optional[str] = None


class RevenueBuyerItem(BaseModel):
    buyer: str
    revenue: float
    order_count: int


class OrderStatusItem(BaseModel):
    status: str
    count: int


class ProductCategoryItem(BaseModel):
    category: str
    count: int


class TopSupplierItem(BaseModel):
    supplier: str
    product_count: int
