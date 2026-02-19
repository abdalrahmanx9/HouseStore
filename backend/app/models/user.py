from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    # Using 'sub' from Google as unique identifier if needed, but email is often enough for simple cases
    # We will expand this with proper auth fields
    full_name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth-only users
    created_at = Column(DateTime(timezone=True), server_default=func.now())
