"""Wishlist endpoints for managing user favorites."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.api import deps
from app import models, schemas, crud
from app.models.wishlist import Wishlist

router = APIRouter()


@router.get("/", response_model=list)
async def get_wishlist(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """Get the current user's wishlist with product details."""
    stmt = (
        select(Wishlist)
        .where(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
    )
    result = await db.execute(stmt)
    wishlist_items = result.scalars().all()

    items = []
    for w in wishlist_items:
        product = await crud.product.get(db, id=w.product_id)
        if product and product.is_active:
            product.stock_count = await crud.product.get_stock_count(db, product.id)  # type: ignore
            items.append({
                "id": w.id,
                "product_id": w.product_id,
                "created_at": w.created_at,
                "product": schemas.Product.model_validate(product).model_dump(),
            })

    return items


@router.post("/")
async def add_to_wishlist(
    product_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """Add a product to the user's wishlist."""
    # Verify product exists
    product = await crud.product.get(db, id=product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Check if already in wishlist
    stmt = select(Wishlist).where(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id,
    )
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        return {"ok": True, "message": "Already in wishlist"}

    item = Wishlist(user_id=current_user.id, product_id=product_id)  # type: ignore
    db.add(item)
    await db.commit()
    return {"ok": True, "message": "Added to wishlist"}


@router.delete("/{product_id}")
async def remove_from_wishlist(
    product_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """Remove a product from the user's wishlist."""
    stmt = delete(Wishlist).where(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id,
    )
    result = await db.execute(stmt)
    await db.commit()

    if result.rowcount == 0:  # type: ignore
        raise HTTPException(status_code=404, detail="Item not in wishlist")

    return {"ok": True, "message": "Removed from wishlist"}


@router.get("/check/{product_id}")
async def check_in_wishlist(
    product_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """Check if a product is in the user's wishlist."""
    stmt = select(Wishlist).where(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id,
    )
    result = await db.execute(stmt)
    exists = result.scalar_one_or_none() is not None
    return {"in_wishlist": exists}
