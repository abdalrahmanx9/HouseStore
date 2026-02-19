from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
import os
import aiofiles

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# Simple disk storage (reusing existing uploads logic)
UPLOAD_DIR = "uploads/support"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=schemas.Ticket)
async def create_ticket(
    *,
    db: AsyncSession = Depends(deps.get_db),
    ticket_in: schemas.TicketCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Create a new support ticket.
    """
    # 1. Create Ticket
    ticket = models.Ticket(
        user_id=current_user.id,
        subject=ticket_in.subject,
        priority=ticket_in.priority,
        status="open",
    )
    db.add(ticket)
    await db.commit()
    await db.refresh(ticket)

    # 2. Create Initial Message
    message = models.TicketMessage(
        ticket_id=ticket.id,
        user_id=current_user.id,
        content=ticket_in.initial_message,
        is_admin=False,  # User created it
    )
    db.add(message)
    await db.commit()

    return ticket


@router.get("/", response_model=List[schemas.Ticket])
async def read_tickets(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Retrieve tickets with unread status.
    """
    # Base query
    stmt = (
        select(models.Ticket)
        .offset(skip)
        .limit(limit)
        .order_by(models.Ticket.updated_at.desc())
    )

    if not current_user.is_superuser:
        stmt = stmt.where(models.Ticket.user_id == current_user.id)

    result = await db.execute(stmt)
    tickets = result.scalars().all()

    # Compute unread status for each ticket (simple N+1 for now, opt later)
    # Ideally should be a JOIN or subquery count
    ticket_responses = []

    for t in tickets:
        # Check for unread messages
        # If Admin: check for unread messages from USER (is_admin=False)
        # If User: check for unread messages from ADMIN (is_admin=True)
        unread_stmt = select(models.TicketMessage).where(
            models.TicketMessage.ticket_id == t.id, models.TicketMessage.read_at == None
        )

        if current_user.is_superuser:
            unread_stmt = unread_stmt.where(models.TicketMessage.is_admin == False)
        else:
            unread_stmt = unread_stmt.where(models.TicketMessage.is_admin == True)

        unread_res = await db.execute(unread_stmt.limit(1))
        has_unread = unread_res.scalar() is not None

        # Manually construct response or attach attribute if using Pydantic from_attributes
        # Since 'has_unread_messages' is not on the model, we can't just return 't'.
        # We need to construct a dict/object that matches schema
        t_dict = {
            "id": t.id,
            "user_id": t.user_id,
            "subject": t.subject,
            "status": t.status,
            "priority": t.priority,
            "created_at": t.created_at,
            "updated_at": t.updated_at,
            "has_unread_messages": has_unread,
        }
        ticket_responses.append(t_dict)

    return ticket_responses


@router.get("/{id}", response_model=schemas.Ticket)
async def read_ticket(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Get ticket details.
    """
    query = select(models.Ticket).where(models.Ticket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Auth Check
    if not current_user.is_superuser and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return ticket


@router.put("/{id}", response_model=schemas.Ticket)
async def update_ticket(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    ticket_in: schemas.TicketUpdate,
    current_user: models.User = Depends(
        deps.get_current_active_superuser
    ),  # Only Admin updates status for now
):
    """
    Update ticket status/priority.
    """
    query = select(models.Ticket).where(models.Ticket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # Update fields
    if ticket_in.status:
        ticket.status = ticket_in.status
    if ticket_in.priority:
        ticket.priority = ticket_in.priority

    await db.commit()
    await db.refresh(ticket)
    return ticket


@router.post("/{id}/messages", response_model=schemas.TicketMessage)
async def create_ticket_message(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    content: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Post a reply to a ticket.
    """
    # Verify Ticket Exists & Auth
    query = select(models.Ticket).where(models.Ticket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if not current_user.is_superuser and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Handle File
    attachment_url = None
    if file:
        file_path = f"{UPLOAD_DIR}/{file.filename}"
        async with aiofiles.open(file_path, "wb") as out_file:
            sys_content = await file.read()
            await out_file.write(sys_content)
        attachment_url = file_path

    # Create Message
    message = models.TicketMessage(
        ticket_id=ticket.id,
        user_id=current_user.id,
        content=content,
        attachment_url=attachment_url,
        is_admin=current_user.is_superuser,
    )
    db.add(message)

    # Auto-reopen ticket if user relies? Optional logic.
    # if not current_user.is_superuser and ticket.status == "closed":
    #     ticket.status = "open"

    await db.commit()
    await db.refresh(message)
    return message


@router.get("/{id}/messages", response_model=List[schemas.TicketMessage])
async def read_ticket_messages(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Get messages for a ticket and MARK AS READ.
    """
    # Verify Ticket Exists & Auth
    query = select(models.Ticket).where(models.Ticket.id == id)
    result = await db.execute(query)
    ticket = result.scalar_one_or_none()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if not current_user.is_superuser and ticket.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get Messages
    query = (
        select(models.TicketMessage)
        .where(models.TicketMessage.ticket_id == id)
        .order_by(models.TicketMessage.created_at)
    )
    result = await db.execute(query)
    messages = result.scalars().all()

    # Mark relevant messages as read
    now = func.now()

    update_stmt = update(models.TicketMessage).where(
        models.TicketMessage.ticket_id == id, models.TicketMessage.read_at == None
    )

    if current_user.is_superuser:
        # Admin reads User messages
        update_stmt = update_stmt.where(models.TicketMessage.is_admin == False)
    else:
        # User reads Admin messages
        update_stmt = update_stmt.where(models.TicketMessage.is_admin == True)

    await db.execute(update_stmt.values(read_at=now))
    await db.commit()

    return messages
