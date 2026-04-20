from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Shared properties
class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


# Properties to receive on creation
class ReviewCreate(ReviewBase):
    product_id: int
    order_id: Optional[int] = None


# Properties to receive on update
class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None
    is_approved: Optional[bool] = None


# Properties shared by models stored in DB
class ReviewInDBBase(ReviewBase):
    id: int
    product_id: int
    order_id: Optional[int] = None
    user_id: int
    is_verified_purchase: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Minimal User schema for Reviews
class UserInReview(BaseModel):
    id: int
    email: Optional[str] = None
    full_name: Optional[str] = None
    picture: Optional[str] = None

    class Config:
        from_attributes = True


# Properties to return to client
class Review(ReviewInDBBase):
    pass


class ReviewWithUser(Review):
    user: Optional[UserInReview] = None


class ProductInReview(BaseModel):
    id: int
    name: str
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ReviewWithUserProduct(ReviewWithUser):
    product: Optional[ProductInReview] = None
