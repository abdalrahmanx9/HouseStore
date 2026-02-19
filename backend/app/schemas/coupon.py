from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator


# Shared properties
class CouponBase(BaseModel):
    code: str
    discount_percent: float = Field(..., ge=0, le=100)
    max_discount_amount: Optional[float] = None
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = True

    @validator("code")
    def code_must_be_uppercase(cls, v):
        return v.upper()


# Properties to receive via API on creation
class CouponCreate(CouponBase):
    pass


# Properties to receive via API on update
class CouponUpdate(BaseModel):
    discount_percent: Optional[float] = Field(None, ge=0, le=100)
    max_discount_amount: Optional[float] = None
    max_uses: Optional[int] = None
    expires_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class Coupon(CouponBase):
    id: int
    used_count: int
    created_at: datetime

    class Config:
        from_attributes = True
