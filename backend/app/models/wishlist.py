from sqlalchemy import (
    Column,
    Integer,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Wishlist(Base):
    __tablename__ = "store_wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    product_id = Column(
        Integer, ForeignKey("store_products.id"), nullable=False, index=True
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("app.models.user.User")
    product = relationship("app.models.product.Product")

    __table_args__ = (
        UniqueConstraint("user_id", "product_id", name="uq_wishlist_user_product"),
    )
