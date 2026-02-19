from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone

from app import models, schemas
from app.api import deps

router = APIRouter()


@router.get("/", response_model=List[schemas.Coupon])
async def read_coupons(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve coupons (Admin only).
    """
    query = select(models.Coupon).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/", response_model=schemas.Coupon)
async def create_coupon(
    *,
    db: AsyncSession = Depends(deps.get_db),
    coupon_in: schemas.CouponCreate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Create new coupon (Admin only).
    """
    coupon = models.Coupon(
        code=coupon_in.code,
        discount_percent=coupon_in.discount_percent,
        max_discount_amount=coupon_in.max_discount_amount,
        max_uses=coupon_in.max_uses,
        expires_at=coupon_in.expires_at,
        is_active=coupon_in.is_active,
    )
    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.put("/{id}", response_model=schemas.Coupon)
async def update_coupon(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    coupon_in: schemas.CouponUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a coupon (Admin only).
    """
    query = select(models.Coupon).where(models.Coupon.id == id)
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    update_data = coupon_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(coupon, field, value)

    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)
    return coupon


@router.delete("/{id}", response_model=schemas.Coupon)
async def delete_coupon(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a coupon (Admin only).
    """
    query = select(models.Coupon).where(models.Coupon.id == id)
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")

    await db.delete(coupon)
    await db.commit()
    return coupon


@router.post("/validate", response_model=schemas.Coupon)
async def validate_coupon(
    *,
    db: AsyncSession = Depends(deps.get_db),
    code: str,
) -> Any:
    """
    Validate a coupon code (Public).
    """
    query = select(models.Coupon).where(models.Coupon.code == code.upper())
    result = await db.execute(query)
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid coupon code")

    if not coupon.is_active:
        raise HTTPException(status_code=400, detail="Coupon is inactive")

    if coupon.expires_at and coupon.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")

    if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    return coupon
