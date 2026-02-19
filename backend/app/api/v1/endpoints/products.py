from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[schemas.Product])
async def read_products(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve products.
    """
    products = await crud.product.get_active(db, skip=skip, limit=limit)
    
    # Inject stock count (N+1 issue here? For small listings it's ok, optimize later if needed)
    for p in products:
        p.stock_count = await crud.product.get_stock_count(db, p.id)
        
    return products

@router.get("/{id}", response_model=schemas.Product)
async def read_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
):
    """
    Get product by ID.
    """
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if active
    if not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_count = await crud.product.get_stock_count(db, id)
    return product

@router.post("/", response_model=schemas.Product)
async def create_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    product_in: schemas.ProductCreate,
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Create new product (Admin Only).
    """
    product = await crud.product.create(db, obj_in=product_in)
    return product

@router.put("/{id}", response_model=schemas.Product)
async def update_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    product_in: schemas.ProductUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Update a product (Admin Only).
    """
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product = await crud.product.update(db, db_obj=product, obj_in=product_in)
    return product

@router.delete("/{id}", response_model=schemas.Product)
async def delete_product(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Delete a product (Admin Only).
    """
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    product = await crud.product.remove(db, id=id)
    return product
