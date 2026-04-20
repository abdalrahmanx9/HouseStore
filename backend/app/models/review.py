from sqlalchemy import (
    Column,
    Integer,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    CheckConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Review(Base):
    __tablename__ = "store_reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(
        Integer, ForeignKey("store_products.id"), nullable=False, index=True
    )
    order_id = Column(Integer, ForeignKey("store_orders.id"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    rating = Column(
        Integer, nullable=False
    )  # 1-5 validation handled in schema/DB constraint
    comment = Column(Text, nullable=True)

    is_verified_purchase = Column(Boolean, default=False)
    is_approved = Column(Boolean, default=True)  # Auto-approve by default

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    product = relationship("Product", back_populates="reviews")
    user = relationship("app.models.user.User")

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="check_rating_range"),
    )
