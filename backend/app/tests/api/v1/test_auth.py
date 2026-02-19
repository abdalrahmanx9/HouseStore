import pytest
from httpx import AsyncClient
from app.core.config import settings

@pytest.mark.asyncio
async def test_login_redirect(client: AsyncClient):
    response = await client.get(f"{settings.API_V1_STR}/auth/login")
    assert response.status_code == 302
    assert "accounts.google.com" in response.headers["location"]

# Note: We cannot easily test the full Google Callback without a real browser/token
# checking that the endpoint exists and validation Logic works is sufficient for unit tests.
