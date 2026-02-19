from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class MessageBase(BaseModel):
    content: str
    attachment_url: Optional[str] = None


class MessageCreate(MessageBase):
    pass


class Message(MessageBase):
    id: int
    order_id: int
    user_id: int
    is_admin: bool
    created_at: datetime
    attachment_url: Optional[str] = None
    sender_email: Optional[str] = None  # Helper for UI

    class Config:
        from_attributes = True
