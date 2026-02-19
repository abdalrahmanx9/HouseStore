import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.main import app

from app.api import deps
from app.models.user import User

@pytest.mark.asyncio
async def test_create_and_read_product(client: AsyncClient):
    # Mock authentication
    async def mock_get_current_user():
        return User(email="test@example.com", is_active=True, is_superuser=True)
    
    app.dependency_overrides[deps.get_current_user] = mock_get_current_user
    
    product_data = {
        "name": "Test Game Key",
        "description": "A test description",
        "price": 50.0,
        "category": "Gaming",
        "subcategory": "Steam",
        "delivery_type": "manual",
        "is_active": True
    }
    
    # Create (Note: Need Admin Auth later, but currently open/TODO)
    # The endpoint in products.py has TODO for admin check, so it allows creation for now.
    response = await client.post(f"{settings.API_V1_STR}/products/", json=product_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == product_data["name"]
    assert "id" in data
    
    product_id = data["id"]
    
    # List
    response = await client.get(f"{settings.API_V1_STR}/products/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    
    # Get Detail
    response = await client.get(f"{settings.API_V1_STR}/products/{product_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == product_id
    assert data["stock_count"] == 0
