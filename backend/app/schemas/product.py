from typing import Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# --- Stock Item Schemas ---
class StockItemBase(BaseModel):
    content: str
    is_sold: bool = False

class StockItemCreate(StockItemBase):
    pass

class StockItem(StockItemBase):
    id: int
    product_id: int
    added_at: datetime
    sold_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    subcategory: Optional[str] = None
    delivery_type: str = "manual"  # manual, auto
    image_url: Optional[str] = None
    terms: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    delivery_type: Optional[str] = None
    is_active: Optional[bool] = None

class Product(ProductBase):
    id: int
    # We might want to return current stock count instead of all items for public view
    stock_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)
