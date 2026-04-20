import pytest
from httpx import AsyncClient
from app.core.config import settings
from app.main import app
from app.api import deps
from app.models.user import User


@pytest.mark.asyncio
async def test_create_and_read_reviews(client: AsyncClient):
    # Mock normal user authentication
    async def mock_get_current_user():
        return User(
            id=1, email="reviewer@example.com", is_active=True, is_superuser=False
        )

    app.dependency_overrides[deps.get_current_user] = mock_get_current_user
    app.dependency_overrides[deps.get_current_active_user] = mock_get_current_user

    # 1. Create a Product to review (We need admin rights for this, so let's temporarily mock admin)
    async def mock_get_current_admin():
        return User(
            id=999, email="admin@example.com", is_active=True, is_superuser=True
        )

    app.dependency_overrides[deps.get_current_active_superuser] = mock_get_current_admin

    product_data = {
        "name": "Reviewable Product",
        "description": "A product for testing reviews",
        "price": 100.0,
        "category": "Test",
        "subcategory": "Reviews",
        "delivery_type": "manual",
        "is_active": True,
    }

    # Create Product
    response = await client.post(f"{settings.API_V1_STR}/products/", json=product_data)
    assert response.status_code == 200
    product = response.json()
    product_id = product["id"]

    # 2. Switch back to Normal User for creating review
    app.dependency_overrides[deps.get_current_active_superuser] = (
        mock_get_current_admin  # valid for delete, but for create we need active user
    )
    app.dependency_overrides[deps.get_current_user] = mock_get_current_user
    app.dependency_overrides[deps.get_current_active_user] = mock_get_current_user

    review_data = {
        "product_id": product_id,
        "order_id": 1,
        "rating": 5,
        "comment": "Amazing product! Highly recommended.",
    }

    # Create Review
    response = await client.post(f"{settings.API_V1_STR}/reviews/", json=review_data)
    assert response.status_code == 200
    review = response.json()
    assert review["product_id"] == product_id
    assert review["rating"] == 5
    assert review["comment"] == "Amazing product! Highly recommended."
    assert not review["is_verified_purchase"]

    # 3. Get Reviews for Product
    response = await client.get(f"{settings.API_V1_STR}/reviews/product/{product_id}")
    assert response.status_code == 200
    reviews = response.json()
    assert len(reviews) >= 1
    assert reviews[0]["comment"] == "Amazing product! Highly recommended."
    assert "user" not in reviews[0]  # Verify user field is NOT present for public

    # 4. Get All Reviews (Admin)
    app.dependency_overrides[deps.get_current_active_superuser] = mock_get_current_admin
    response = await client.get(f"{settings.API_V1_STR}/reviews/")
    assert response.status_code == 200
    all_reviews = response.json()
    assert len(all_reviews) >= 1
    assert all_reviews[0]["product_id"] == product_id
    assert "user" in all_reviews[0]

    # 5. Delete Review (Admin)
    review_id = all_reviews[0]["id"]
    response = await client.delete(f"{settings.API_V1_STR}/reviews/{review_id}")
    assert response.status_code == 200
    deleted_review = response.json()
    assert deleted_review["id"] == review_id

    # Verify deletion
    response = await client.get(f"{settings.API_V1_STR}/reviews/product/{product_id}")
    assert response.status_code == 200
    reviews_after = response.json()
    assert len(reviews_after) == 0

    # Cleanup overrides
    app.dependency_overrides = {}
