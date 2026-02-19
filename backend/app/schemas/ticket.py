from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


# Message Schemas
class TicketMessageBase(BaseModel):
    content: str
    attachment_url: Optional[str] = None


class TicketMessageCreate(TicketMessageBase):
    pass


class TicketMessage(TicketMessageBase):
    id: int
    ticket_id: int
    user_id: int
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Ticket Schemas
class TicketBase(BaseModel):
    subject: str
    priority: str = "normal"


class TicketCreate(TicketBase):
    initial_message: str  # To create a ticket, you usually start with a message


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None


class Ticket(TicketBase):
    id: int
    user_id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime]
    has_unread_messages: bool = False  # [New] UI Indicator

    class Config:
        from_attributes = True
