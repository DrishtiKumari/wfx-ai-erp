"""
Pydantic schemas for product endpoints.
Defines request validation and response shapes.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class ProductItem(BaseModel):
    """A single product in listing responses."""
    id: Optional[int] = None
    style_number: str
    style_name: Optional[str] = None
    category: Optional[str] = None
    supplier: Optional[str] = None
    fabric: Optional[str] = None
    gsm: Optional[int] = None
    color: Optional[str] = None
    print: Optional[str] = None
    size_range: Optional[str] = None
    season: Optional[str] = None
    brand: Optional[str] = None
    cost: Optional[float] = None
    selling_price: Optional[float] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    trend_score: Optional[int] = None
    ai_demand: Optional[str] = None


class ProductListResponse(BaseModel):
    """Paginated product list response."""
    items: List[ProductItem]
    total: int
    page: int
    page_size: int
    total_pages: int


class ProductFilters(BaseModel):
    """Available filter options for the product search UI."""
    categories: List[str]
    fabrics: List[str]
    suppliers: List[str]
    colors: List[str]
    seasons: List[str]
    price_min: float
    price_max: float
