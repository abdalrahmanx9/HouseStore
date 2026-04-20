import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.main import app
from app.api import deps
from app.models.user import User
import random


@pytest.mark.asyncio
async def test_ticket_flow_real(client: AsyncClient, db: AsyncSession):
    # Create User
    # Use random email to avoid collision
    rand_id = random.randint(1000, 9999)
    email = f"testuser{rand_id}@example.com"

    user = User(email=email, is_active=True, is_superuser=False)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    user_id = user.id

    # Mock User
    async def mock_user():
        return User(id=user_id, email=email, is_active=True, is_superuser=False)

    app.dependency_overrides[deps.get_current_active_user] = mock_user
    app.dependency_overrides[deps.get_optional_current_user] = mock_user

    # Create Ticket
    ticket_data = {
        "subject": "Help me!",
        "priority": "normal",
        "initial_message": "My first message",
    }

    res = await client.post(f"{settings.API_V1_STR}/tickets/", json=ticket_data)
    assert res.status_code == 200
    ticket = res.json()
    assert ticket["subject"] == "Help me!"
    ticket_id = ticket["id"]

    # User lists tickets
    res = await client.get(f"{settings.API_V1_STR}/tickets/")
    assert res.status_code == 200
    tickets = res.json()
    assert len(tickets) >= 1
    assert tickets[0]["id"] == ticket_id

    # User reads messages
    res = await client.get(f"{settings.API_V1_STR}/tickets/{ticket_id}/messages")
    assert res.status_code == 200
    messages = res.json()
    assert len(messages) == 1
    assert messages[0]["content"] == "My first message"

    app.dependency_overrides.clear()

    # Admin replies
    # Need to create Admin user too?
    admin_email = f"admin{rand_id}@example.com"
    admin = User(email=admin_email, is_active=True, is_superuser=True)
    db.add(admin)
    await db.commit()
    await db.refresh(admin)
    admin_id = admin.id

    async def mock_superuser():
        return User(id=admin_id, email=admin_email, is_active=True, is_superuser=True)

    app.dependency_overrides[deps.get_current_active_user] = mock_superuser

    # Post as form data
    res = await client.post(
        f"{settings.API_V1_STR}/tickets/{ticket_id}/messages",
        data={"content": "Admin reply here"},
    )
    assert res.status_code == 200
    reply = res.json()
    assert reply["content"] == "Admin reply here"
    assert reply["is_admin"]

    # User verifies reply
    app.dependency_overrides[deps.get_current_active_user] = mock_user
    res = await client.get(f"{settings.API_V1_STR}/tickets/{ticket_id}/messages")
    messages = res.json()
    assert len(messages) == 2
    assert messages[1]["content"] == "Admin reply here"

    app.dependency_overrides.clear()
