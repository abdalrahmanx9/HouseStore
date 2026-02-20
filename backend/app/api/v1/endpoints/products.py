from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps
from app.models.user import User
from app.utils.file_utils import save_upload_file, delete_local_file

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


@router.post("/{id}/image", response_model=schemas.Product)
async def upload_product_image(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """
    Upload an image for a product (Admin Only).
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Delete old image if it exists and is a local file
    if product.image_url and product.image_url.startswith("/files/"):
        delete_local_file(product.image_url)

    new_url = await save_upload_file(file, "products")
    if not new_url:
        raise HTTPException(status_code=500, detail="Failed to save image")

    # Update the product's image_url
    product_in = schemas.ProductUpdate(image_url=new_url)
    product = await crud.product.update(db, db_obj=product, obj_in=product_in)

    return product
