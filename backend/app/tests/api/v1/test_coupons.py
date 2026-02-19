import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.main import app
from app.api import deps
from app.models.user import User
from datetime import datetime, timedelta, timezone


@pytest.mark.asyncio
async def test_create_and_validate_coupon(client: AsyncClient):
    # Mock Superuser
    async def mock_superuser():
        return User(id=1, email="admin@example.com", is_active=True, is_superuser=True)

    app.dependency_overrides[deps.get_current_active_superuser] = mock_superuser

    import random

    code = f"TEST{random.randint(1000, 9999)}"
    coupon_data = {
        "code": code,
        "discount_percent": 10.0,
        "is_active": True,
        "max_uses": 10,
    }

    # Create
    res = await client.post(f"{settings.API_V1_STR}/coupons/", json=coupon_data)
    assert res.status_code == 200
    data = res.json()
    assert data["code"] == code
    assert data["discount_percent"] == 10.0

    # Validate (Public)
    res = await client.post(f"{settings.API_V1_STR}/coupons/validate?code={code}")
    assert res.status_code == 200
    data = res.json()
    assert data["code"] == code

    app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_coupon_expiration(client: AsyncClient):
    # Mock Superuser
    async def mock_superuser():
        return User(id=1, email="admin@example.com", is_active=True, is_superuser=True)

    app.dependency_overrides[deps.get_current_active_superuser] = mock_superuser

    # Create expired coupon
    import random

    code = f"EXPIRED{random.randint(1000, 9999)}"
    expired_date = (datetime.now(timezone.utc) - timedelta(days=1)).isoformat()
    coupon_data = {
        "code": code,
        "discount_percent": 20.0,
        "is_active": True,
        "expires_at": expired_date,
    }

    res = await client.post(f"{settings.API_V1_STR}/coupons/", json=coupon_data)
    assert res.status_code == 200

    # Validate
    res = await client.post(f"{settings.API_V1_STR}/coupons/validate?code={code}")
    assert res.status_code == 400
    assert "expired" in res.json()["detail"].lower()

    app.dependency_overrides.clear()
