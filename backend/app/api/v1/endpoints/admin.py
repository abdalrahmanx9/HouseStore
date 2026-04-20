"""Admin-only endpoints for dashboard statistics and analytics."""

import csv
import io
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
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


@router.get("/export/orders")
async def export_orders_csv(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """Export all orders as CSV."""
    stmt = select(models.Order).order_by(models.Order.id.desc())
    result = await db.execute(stmt)
    orders = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Product", "Amount", "Status", "Payment Method", "Coupon", "Created At"])
    for o in orders:
        writer.writerow([
            o.id, o.product_name, o.amount, o.status,
            o.payment_method, o.coupon_code or "",
            str(o.created_at),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=orders_{datetime.now().strftime('%Y%m%d')}.csv"},
    )


@router.get("/export/users")
async def export_users_csv(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """Export all users as CSV."""
    stmt = select(models.User).order_by(models.User.id.desc())
    result = await db.execute(stmt)
    users = result.scalars().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Email", "Full Name", "Active", "Superuser", "Created At"])
    for u in users:
        writer.writerow([
            u.id, u.email, u.full_name or "",
            u.is_active, u.is_superuser, str(u.created_at),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=users_{datetime.now().strftime('%Y%m%d')}.csv"},
    )


@router.get("/product-analytics")
async def get_product_analytics(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """Get per-product analytics: orders, revenue, avg rating."""
    from app.models.review import Review
    from app.models.product import Product

    stmt = select(Product).where(Product.is_active == True).order_by(Product.id.desc())  # noqa: E712
    result = await db.execute(stmt)
    products = result.scalars().all()

    analytics = []
    for p in products:
        # Total orders and revenue for this product
        order_stats = await db.execute(
            select(
                func.count(models.Order.id).label("total_orders"),
                func.coalesce(func.sum(models.Order.amount), 0).label("total_revenue"),
            ).where(models.Order.product_id == p.id)
        )
        row = order_stats.one()

        # Completed orders revenue
        completed_stats = await db.execute(
            select(
                func.count(models.Order.id).label("completed_orders"),
                func.coalesce(func.sum(models.Order.amount), 0).label("completed_revenue"),
            ).where(
                models.Order.product_id == p.id,
                models.Order.status == "completed",
            )
        )
        c_row = completed_stats.one()

        # Average rating
        avg_stmt = select(func.avg(Review.rating)).where(
            Review.product_id == p.id,
            Review.is_approved == True,  # noqa: E712
        )
        avg_rating = (await db.execute(avg_stmt)).scalar()

        # Stock count
        from app.models.product import StockItem
        stock_count = (await db.execute(
            select(func.count(StockItem.id)).where(
                StockItem.product_id == p.id,
                StockItem.is_sold == False,  # noqa: E712
            )
        )).scalar() or 0

        analytics.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "total_orders": row.total_orders,
            "total_revenue": float(row.total_revenue),
            "completed_orders": c_row.completed_orders,
            "completed_revenue": float(c_row.completed_revenue),
            "average_rating": round(float(avg_rating), 1) if avg_rating else None,
            "stock_count": stock_count,
        })

    return analytics
