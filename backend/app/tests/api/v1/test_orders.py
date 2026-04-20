import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.main import app
from app.api import deps
from app.models.user import User

import json


@pytest.mark.asyncio
async def test_create_order(client: AsyncClient, db):
    user = User(email="testuser@example.com", is_active=True, is_superuser=False)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    user_id = user.id

    async def mock_get_current_active_user():
        return User(
            id=user_id, email="testuser@example.com", is_active=True, is_superuser=False
        )

    app.dependency_overrides[deps.get_current_active_user] = (
        mock_get_current_active_user
    )

    product_data = {
        "name": "Order Test Product",
        "description": "Test Desc",
        "price": 100.0,
        "category": "Test",
        "delivery_type": "manual",
        "is_active": True,
    }

    async def mock_get_current_active_superuser():
        return User(id=999, email="admin@example.com", is_active=True, is_superuser=True)

    app.dependency_overrides[deps.get_current_active_superuser] = (
        mock_get_current_active_superuser
    )

    prod_res = await client.post(f"{settings.API_V1_STR}/products/", json=product_data)
    assert prod_res.status_code == 200
    product_id = prod_res.json()["id"]

    cart_items = [{"id": product_id, "quantity": 2}]

    files = {"payment_proof": ("proof.png", b"fake image data", "image/png")}
    data = {
        "items": json.dumps(cart_items),
        "payment_method": "bank_transfer",
        "full_name": "Test Buyer",
        "email": "buyer@example.com",
    }

    response = await client.post(
        f"{settings.API_V1_STR}/orders/", data=data, files=files
    )

    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 2
    assert orders[0]["product_id"] == product_id
    assert orders[0]["amount"] == 100.0
    assert orders[0]["status"] == "pending"

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_read_orders(client: AsyncClient, db):
    user = User(email="user@example.com", is_active=True, is_superuser=False)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    user_id = user.id

    async def mock_user():
        return User(
            id=user_id, email="user@example.com", is_active=True, is_superuser=False
        )

    app.dependency_overrides[deps.get_current_active_user] = mock_user

    async def mock_superuser():
        return User(id=2, email="admin@example.com", is_active=True, is_superuser=True)

    app.dependency_overrides[deps.get_current_active_superuser] = mock_superuser

    product_data = {
        "name": "Read Order Test Product",
        "description": "Test Desc",
        "price": 50.0,
        "category": "Test",
        "delivery_type": "manual",
        "is_active": True,
    }
    prod_res = await client.post(f"{settings.API_V1_STR}/products/", json=product_data)
    assert prod_res.status_code == 200
    product_id = prod_res.json()["id"]

    cart_items = [{"id": product_id, "quantity": 1}]
    files = {"payment_proof": ("proof.png", b"fake image data", "image/png")}
    data = {
        "items": json.dumps(cart_items),
        "payment_method": "bank_transfer",
        "full_name": "Test Buyer",
        "email": "buyer@example.com",
    }

    res = await client.post(f"{settings.API_V1_STR}/orders/", data=data, files=files)
    assert res.status_code == 200

    response = await client.get(f"{settings.API_V1_STR}/orders/")
    assert response.status_code == 200
    orders = response.json()
    assert isinstance(orders, list)
    assert len(orders) >= 1

    created_order_id = res.json()[0]["id"]
    found = any(o["id"] == created_order_id for o in orders)
    assert found

    app.dependency_overrides.clear()
