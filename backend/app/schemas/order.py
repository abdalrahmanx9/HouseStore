from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class OrderBase(BaseModel):
    product_id: int
    product_name: str
    amount: float
    status: str = "pending"
    payment_method: Optional[str] = None
    payment_proof_url: Optional[str] = None
    coupon_code: Optional[str] = None

class OrderCreate(OrderBase):
    pass

class OrderUpdate(OrderBase):
    status: Optional[str] = None
    pass

class Order(OrderBase):
    id: int
    user_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True
