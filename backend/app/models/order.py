from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.models.base import Base

class Coupon(Base):
    __tablename__ = "store_coupons"

    code = Column(String(20), primary_key=True)
    amount = Column(Float, nullable=False)
    usage_limit = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class Order(Base):
    __tablename__ = "store_orders"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True) # Linked to Web User
    discord_user_id = Column(BigInteger, nullable=True) # Optional link to Discord ID
    
    product_id = Column(Integer, ForeignKey("store_products.id"), nullable=False)
    product_name = Column(String(100), nullable=False)

    status = Column(String(20), default="pending", index=True)
    amount = Column(Float, nullable=False)

    coupon_code = Column(String(20), ForeignKey("store_coupons.code"), nullable=True)
    payment_method = Column(String(50), nullable=True)
    payment_proof_url = Column(String(255), nullable=True) # [New] for web uploads

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    payment_at = Column(DateTime(timezone=True), nullable=True)
    delivered_at = Column(DateTime(timezone=True), nullable=True)

    product = relationship("Product", back_populates="orders")
    # user = relationship("User", back_populates="orders") 
