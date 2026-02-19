from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/product/{product_id}", response_model=List[schemas.Review])
async def read_product_reviews(
    product_id: int,
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve reviews for a specific product.
    Only returns approved reviews.
    """
    query = (
        select(models.Review)
        .options(selectinload(models.Review.user))
        .where(
            models.Review.product_id == product_id, models.Review.is_approved == True
        )
        .offset(skip)
        .limit(limit)
        .order_by(models.Review.created_at.desc())
    )

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/", response_model=List[schemas.ReviewWithUser])
async def read_reviews(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve all reviews (Admin only).
    """
    query = (
        select(models.Review)
        .options(selectinload(models.Review.user))
        .offset(skip)
        .limit(limit)
        .order_by(models.Review.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=schemas.Review)
async def create_review(
    *,
    db: AsyncSession = Depends(deps.get_db),
    review_in: schemas.ReviewCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new review.
    """
    # Check if user already reviewed this product? (Optional: prevent spam)
    # For now, allow multiple reviews or assume frontend handles simple checks.

    # Check if verified purchase (Has user bought this product and order is completed?)
    # This is a bit complex query.
    # EXISTS(SELECT 1 FROM orders WHERE user_id = :uid AND product_id = :pid AND status = 'completed')

    verified = False
    query = select(models.Order).where(
        models.Order.user_id == current_user.id,
        models.Order.product_id == review_in.product_id,
        models.Order.status == "completed",
    )
    result = await db.execute(query)
    if result.scalars().first():
        verified = True

    review = models.Review(
        product_id=review_in.product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
        is_verified_purchase=verified,
        is_approved=True,  # Auto-approve
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review


@router.delete("/{id}", response_model=schemas.Review)
async def delete_review(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a review (Admin only).
    """
    query = select(models.Review).where(models.Review.id == id)
    result = await db.execute(query)
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    await db.delete(review)
    await db.commit()
    return review
