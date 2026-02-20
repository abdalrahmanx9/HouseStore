from typing import Optional
from pydantic import BaseModel, ConfigDict


class UserBase(BaseModel):
    email: Optional[str] = None
    is_active: Optional[bool] = True
    is_superuser: bool = False
    full_name: Optional[str] = None
    picture: Optional[str] = None


class UserCreate(UserBase):
    email: str
    password: str
    full_name: Optional[str] = None


class UserUpdate(UserBase):
    password: Optional[str] = None


class User(UserBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
