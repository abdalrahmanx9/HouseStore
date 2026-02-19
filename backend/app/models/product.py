from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Product(Base):
    __tablename__ = "store_products"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(50), nullable=False, index=True)
    subcategory = Column(String(50), nullable=True, index=True)
    delivery_type = Column(String(20), nullable=False, default="manual")
    image_url = Column(String(255), nullable=True)
    terms = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    stock_items = relationship(
        "StockItem", back_populates="product", cascade="all, delete-orphan"
    )
    orders = relationship("Order", back_populates="product")
    reviews = relationship(
        "Review", back_populates="product", cascade="all, delete-orphan"
    )


class StockItem(Base):
    __tablename__ = "store_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    product_id = Column(
        Integer, ForeignKey("store_products.id"), nullable=False, index=True
    )
    content = Column(Text, nullable=False)
    is_sold = Column(Boolean, default=False, index=True)
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    sold_at = Column(DateTime(timezone=True), nullable=True)

    product = relationship("Product", back_populates="stock_items")
