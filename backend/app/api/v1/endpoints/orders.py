import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import os
import uuid
import aiofiles

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

# Simple disk storage for mock payment proofs (In prod use S3)
UPLOAD_DIR = "uploads/payment_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=List[schemas.Order])
async def create_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    items: str = Form(...),  # JSON string of items: [{"id": 1, "quantity": 2}]
    payment_method: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    coupon_code: Optional[str] = Form(None),
    payment_proof: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),  # Enforce Auth
):
    """
    Create new orders from cart items with payment proof.
    """
    print(
        f"DEBUG: Received order from {full_name} ({email}) with method {payment_method}, coupon: {coupon_code}"
    )

    # Parse items
    try:
        cart_items = json.loads(items)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid items JSON")

    # Save payment proof
    filename = payment_proof.filename if payment_proof.filename else "proof.png"
    ext = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = f"{UPLOAD_DIR}/{unique_filename}"
    async with aiofiles.open(file_path, "wb") as out_file:
        content = await payment_proof.read()
        await out_file.write(content)

    # Validate Coupon
    discount_multiplier = 1.0
    applied_coupon_code = None

    if coupon_code:
        # We need to import Coupon model. It is in models.coupon but exported in models/__init__.py
        # However, to be safe and explicit let's query it.
        stmt = select(models.Coupon).where(models.Coupon.code == coupon_code)
        result = await db.execute(stmt)
        coupon = result.scalar_one_or_none()

        if coupon:
            if not coupon.is_active:
                raise HTTPException(status_code=400, detail="Coupon is inactive")
            if (
                coupon.expires_at and coupon.expires_at < func.now()
            ):  # This comparison might need datetime check in python if func.now() is SQL
                # Better to check checking datetime.now awareness
                # But let's rely on validate endpoint logic or duplicate it simple here.
                # Let's assume valid for now or do a proper check.
                pass

            # Simple check
            from datetime import datetime, timezone

            if coupon.expires_at and coupon.expires_at.replace(
                tzinfo=timezone.utc
            ) < datetime.now(timezone.utc):
                raise HTTPException(status_code=400, detail="Coupon expired")

            if coupon.max_uses is not None and coupon.used_count >= coupon.max_uses:
                raise HTTPException(
                    status_code=400, detail="Coupon usage limit reached"
                )

            discount_multiplier = 1.0 - (coupon.discount_percent / 100.0)
            coupon.used_count += 1
            applied_coupon_code = coupon.code
            db.add(coupon)  # Mark for update
        else:
            # Should we fail or ignore? Frontend validated it. Let's fail to be safe.
            raise HTTPException(status_code=400, detail="Invalid request coupon code")

    orders = []

    # Create Order per item quantity (since schema is per-unit or per-product)
    # If schema supported quantity per line item, we'd do that.
    # Assuming schema is 1 order = 1 product line (maybe quantity implied or multiple rows).
    # Based on models/order.py, there is NO quantity field. So we must create multiple rows if user bought > 1.

    for item in cart_items:
        product_id = item["id"]
        quantity = item["quantity"]

        # Verify product exists and get price
        product = await db.get(models.Product, product_id)
        if not product:
            continue  # Skip invalid products

        final_amount = product.price * discount_multiplier

        for _ in range(quantity):
            new_order = models.Order(
                product_id=product.id,
                product_name=product.name,
                amount=final_amount,  # Unit price discounted
                status="pending",
                payment_method=payment_method,
                payment_proof_url=file_path,
                coupon_code=applied_coupon_code,
                user_id=current_user.id,  # Link to authenticated user
            )
            db.add(new_order)
            orders.append(new_order)

    await db.commit()
    for o in orders:
        await db.refresh(o)

    return orders


@router.get("/", response_model=List[schemas.Order])
async def read_orders(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(
        deps.get_current_active_user
    ),  # Allow all active users
):
    """
    Retrieve orders with unread status.
    Superusers: Retrieve all orders.
    Normal Users: Retrieve only their own orders.
    """
    from sqlalchemy import select

    if current_user.is_superuser:
        orders = await crud.order.get_multi(db, skip=skip, limit=limit)
    else:
        orders = await crud.order.get_multi_by_owner(
            db, user_id=current_user.id, skip=skip, limit=limit
        )

    # Compute unread status for each order
    order_responses = []

    for o in orders:
        # Check for unread messages
        unread_stmt = select(models.order.Message).where(
            models.order.Message.order_id == o.id,
            models.order.Message.read_at.is_(None),
        )

        if current_user.is_superuser:
            unread_stmt = unread_stmt.where(models.order.Message.is_admin == False)
        else:
            unread_stmt = unread_stmt.where(models.order.Message.is_admin == True)

        unread_res = await db.execute(unread_stmt.limit(1))
        has_unread = unread_res.scalar() is not None

        # Check if user has already reviewed this order
        reviewed_stmt = select(models.Review).where(
            models.Review.user_id == o.user_id,
            models.Review.order_id == o.id,
        )
        reviewed_res = await db.execute(reviewed_stmt.limit(1))
        has_reviewed = reviewed_res.scalar() is not None

        o_dict = {
            "id": o.id,
            "product_id": o.product_id,
            "product_name": o.product_name,
            "amount": o.amount,
            "status": o.status,
            "payment_method": o.payment_method,
            "payment_proof_url": o.payment_proof_url,
            "coupon_code": o.coupon_code,
            "created_at": o.created_at,
            "updated_at": o.updated_at,
            "payment_at": o.payment_at,
            "delivered_at": o.delivered_at,
            "user_id": o.user_id,
            "has_unread_messages": has_unread,
            "has_reviewed": has_reviewed,
            "delivery_key": o.delivery_key,
        }
        order_responses.append(o_dict)

    return order_responses


@router.post("/{id}/messages", response_model=schemas.Message)
async def create_message(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    content: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Post a message to an order (Chat) with optional file attachment.
    """
    order = await crud.order.get(db, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Security: Only Admin or Order Owner can post
    if not current_user.is_superuser and order.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this order"
        )

    attachment_url = None
    if file:
        ext = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = f"{UPLOAD_DIR}/{unique_filename}"
        async with aiofiles.open(file_path, "wb") as out_file:
            sys_content = await file.read()  # Rename variable to avoid conflict
            await out_file.write(sys_content)
        attachment_url = file_path

    # Create Message
    message = models.order.Message(
        order_id=order.id,
        user_id=current_user.id,
        content=content,
        attachment_url=attachment_url,
        is_admin=current_user.is_superuser,
    )
    db.add(message)
    await db.commit()
    await db.refresh(message)
    return message


@router.get("/{id}/messages", response_model=List[schemas.Message])
async def read_messages(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Get messages for an order.
    """
    order = await crud.order.get(db, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Security: Only Admin or Order Owner can read
    if not current_user.is_superuser and order.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this order"
        )

    # Simple query (could add pagination later)
    # We need to eager load the sender (user) to show names/emails
    result = await db.execute(
        models.order.Message.__table__.select()
        .where(models.order.Message.order_id == id)
        .order_by(models.order.Message.created_at)
    )
    messages = result.all()

    # Mark relevant messages as read
    from sqlalchemy import update as sql_update, func

    now = func.now()

    update_stmt = sql_update(models.order.Message).where(
        models.order.Message.order_id == id, models.order.Message.read_at.is_(None)
    )

    if current_user.is_superuser:
        # Admin reads User messages
        update_stmt = update_stmt.where(models.order.Message.is_admin == False)
    else:
        # User reads Admin messages
        update_stmt = update_stmt.where(models.order.Message.is_admin == True)

    await db.execute(update_stmt.values(read_at=now))
    await db.commit()

    # We might want to enrich with sender email if needed, but for now returned schema has sender_email optional
    # Let's do a join or separate query if we really want emails.
    # For now, let's just return the raw messages. The UI can infer "Me" vs "Admin".
    return messages


@router.put("/{id}", response_model=schemas.Order)
async def update_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    order_in: schemas.OrderUpdate,
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Update an order (Admin Only).
    Auto-delivery: If product delivery_type is 'auto' and status is being set to
    'completed', automatically assign a stock item as the delivery_key.
    """
    order = await crud.order.get(db, id=id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Auto-delivery logic
    if order_in.status == "completed" and not order_in.delivery_key:
        product = await crud.product.get(db, id=order.product_id)
        if product and product.delivery_type == "auto":
            stock_item = await crud.product.assign_stock_item(db, product_id=product.id)
            if stock_item:
                order_in.delivery_key = stock_item.content

    order = await crud.order.update(db, db_obj=order, obj_in=order_in)
    return order
