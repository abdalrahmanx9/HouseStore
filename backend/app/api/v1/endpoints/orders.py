import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
import os
import aiofiles

from app import crud, models, schemas
from app.api import deps
from app.models.product import Product

router = APIRouter()

# Simple disk storage for mock payment proofs (In prod use S3)
UPLOAD_DIR = "uploads/payment_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=List[schemas.Order])
async def create_order(
    *,
    db: AsyncSession = Depends(deps.get_db),
    items: str = Form(...), # JSON string of items: [{"id": 1, "quantity": 2}]
    payment_method: str = Form(...),
    full_name: str = Form(...),
    email: str = Form(...),
    payment_proof: UploadFile = File(...),
):
    """
    Create new orders from cart items with payment proof.
    """
    print(f"DEBUG: Received order from {full_name} ({email}) with method {payment_method}")
    
    # Parse items
    try:
        cart_items = json.loads(items)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid items JSON")

    # Save payment proof
    file_path = f"{UPLOAD_DIR}/{payment_proof.filename}"
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await payment_proof.read()
        await out_file.write(content)
    
    orders = []
    
    # Create Order per item quantity (since schema is per-unit or per-product)
    # If schema supported quantity per line item, we'd do that.
    # Assuming schema is 1 order = 1 product line (maybe quantity implied or multiple rows).
    # Based on models/order.py, there is NO quantity field. So we must create multiple rows if user bought > 1.
    
    for item in cart_items:
        product_id = item['id']
        quantity = item['quantity']
        
        # Verify product exists and get price
        product = await db.get(models.Product, product_id)
        if not product:
            continue # Skip invalid products
            
        for _ in range(quantity):
            new_order = models.Order(
                product_id=product.id,
                product_name=product.name,
                amount=product.price, # Unit price
                status="pending",
                payment_method=payment_method,
                payment_proof_url=file_path,
                # user_id? We don't force login yet.
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
    current_user: models.User = Depends(deps.get_current_active_superuser),
):
    """
    Retrieve orders.
    """
    orders = await crud.order.get_multi(db, skip=skip, limit=limit)
    return orders
