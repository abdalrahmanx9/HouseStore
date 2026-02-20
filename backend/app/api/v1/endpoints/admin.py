"""Admin-only endpoints for dashboard statistics and analytics."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta, timezone

from app.api import deps
from app import models, schemas

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Get aggregated KPI stats for the admin dashboard.
    Returns: total_revenue, total_orders, pending_orders, completed_orders,
             rejected_orders, total_products, active_products, total_users,
             open_tickets, total_reviews.
    """
    # Revenue (completed orders only)
    rev_stmt = select(func.coalesce(func.sum(models.Order.amount), 0)).where(
        models.Order.status == "completed"
    )
    total_revenue = (await db.execute(rev_stmt)).scalar()

    # Order counts
    total_orders = (await db.execute(select(func.count(models.Order.id)))).scalar()
    pending_orders = (
        await db.execute(
            select(func.count(models.Order.id)).where(models.Order.status == "pending")
        )
    ).scalar()
    completed_orders = (
        await db.execute(
            select(func.count(models.Order.id)).where(
                models.Order.status == "completed"
            )
        )
    ).scalar()
    rejected_orders = (
        await db.execute(
            select(func.count(models.Order.id)).where(models.Order.status == "rejected")
        )
    ).scalar()

    # Products
    total_products = (await db.execute(select(func.count(models.Product.id)))).scalar()
    active_products = (
        await db.execute(
            select(func.count(models.Product.id)).where(
                models.Product.is_active == True  # noqa: E712
            )
        )
    ).scalar()

    # Users
    total_users = (await db.execute(select(func.count(models.User.id)))).scalar()

    # Tickets
    open_tickets = (
        await db.execute(
            select(func.count(models.Ticket.id)).where(models.Ticket.status == "open")
        )
    ).scalar()

    # Reviews
    total_reviews = (await db.execute(select(func.count(models.Review.id)))).scalar()

    return {
        "total_revenue": float(total_revenue or 0),
        "total_orders": total_orders or 0,
        "pending_orders": pending_orders or 0,
        "completed_orders": completed_orders or 0,
        "rejected_orders": rejected_orders or 0,
        "total_products": total_products or 0,
        "active_products": active_products or 0,
        "total_users": total_users or 0,
        "open_tickets": open_tickets or 0,
        "total_reviews": total_reviews or 0,
    }


@router.get("/revenue-chart")
async def get_revenue_chart(
    days: int = 30,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Get daily revenue for the last N days (completed orders only).
    Returns a list of {date, revenue, count} objects.
    """
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    stmt = (
        select(
            func.date(models.Order.created_at).label("date"),
            func.coalesce(func.sum(models.Order.amount), 0).label("revenue"),
            func.count(models.Order.id).label("count"),
        )
        .where(
            models.Order.status == "completed",
            models.Order.created_at >= start_date,
        )
        .group_by(func.date(models.Order.created_at))
        .order_by(func.date(models.Order.created_at))
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "date": str(row.date),
            "revenue": float(row.revenue),
            "count": row.count,
        }
        for row in rows
    ]


@router.get("/users", response_model=List[schemas.User])
async def get_all_users(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Get all users for admin dashboard.
    """
    result = await db.execute(select(models.User).order_by(models.User.id.desc()))
    return result.scalars().all()


@router.put("/users/{user_id}/active", response_model=schemas.User)
async def toggle_user_active(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Toggle a user's active status.
    """
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own active status")
        
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = not user.is_active
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/users/{user_id}/superuser", response_model=schemas.User)
async def toggle_user_superuser(
    user_id: int,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Toggle a user's superuser status.
    """
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot toggle your own superuser status")
        
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_superuser = not user.is_superuser
    await db.commit()
    await db.refresh(user)
    return user
