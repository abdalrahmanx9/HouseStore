from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.models.base import Base


class Ticket(Base):
    __tablename__ = "store_tickets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, ForeignKey("users.id"), nullable=True
    )  # Optional: generic visitors could potentially open tickets? For now let's say authenticated.

    subject = Column(String, nullable=False)
    status = Column(String, default="open", index=True)  # open, closed
    priority = Column(String, default="normal")  # low, normal, high
    guest_email = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # user = relationship("User", back_populates="tickets")
    messages = relationship(
        "TicketMessage", back_populates="ticket", cascade="all, delete-orphan"
    )


class TicketMessage(Base):
    __tablename__ = "store_ticket_messages"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("store_tickets.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    content = Column(String, nullable=False)
    attachment_url = Column(String(255), nullable=True)
    is_admin = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True), nullable=True)  # [New] Read Receipt

    ticket = relationship("Ticket", back_populates="messages")
    user = relationship("app.models.user.User")
