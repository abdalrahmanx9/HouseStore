from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas
from app.api import deps
from app.models.user import User
from app.utils.file_utils import save_upload_file, delete_local_file

router = APIRouter()


@router.get("/search")
async def search_products(
    db: AsyncSession = Depends(deps.get_db),
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None, description="Category filter"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    sort_by: str = Query("newest", regex="^(newest|price_asc|price_desc|name)$"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    """
    Search/filter products with pagination.
    Returns: { items, total, page, per_page, total_pages }
    """
    skip = (page - 1) * per_page
    products, total = await crud.product.search_products(
        db,
        q=q,
        category=category,
        min_price=min_price,
        max_price=max_price,
        sort_by=sort_by,
        skip=skip,
        limit=per_page,
    )

    # Inject stock count + rating for each product
    items = []
    for p in products:
        p.stock_count = await crud.product.get_stock_count(db, p.id)
        item = schemas.Product.model_validate(p).model_dump()
        item["average_rating"] = await crud.product.get_average_rating(db, p.id)
        item["review_count"] = await crud.product.get_review_count(db, p.id)
        items.append(item)

    total_pages = (total + per_page - 1) // per_page

    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
    }


@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(deps.get_db),
):
    """Get all available product categories."""
    categories = await crud.product.get_categories(db)
    return categories


@router.get("/", response_model=List[schemas.Product])
async def read_products(
    db: AsyncSession = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    """
    Retrieve products (legacy endpoint, use /search for filtering).
    """
    products = await crud.product.get_active(db, skip=skip, limit=limit)

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

    if not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found")

    product.stock_count = await crud.product.get_stock_count(db, id)
    return product


@router.get("/{id}/related", response_model=List[schemas.Product])
async def get_related_products(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    limit: int = Query(4, ge=1, le=10),
):
    """Get related products (same category)."""
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    related = await crud.product.get_related(db, product_id=id, category=product.category, limit=limit)
    for p in related:
        p.stock_count = await crud.product.get_stock_count(db, p.id)
    return related


@router.get("/{id}/rating")
async def get_product_rating(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
):
    """Get average rating and breakdown for a product."""
    from sqlalchemy import select, func
    from app.models.review import Review

    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    avg_rating = await crud.product.get_average_rating(db, id)
    review_count = await crud.product.get_review_count(db, id)

    # Get rating breakdown (1-5 stars count)
    breakdown = {}
    for stars in range(1, 6):
        stmt = select(func.count(Review.id)).where(
            Review.product_id == id,
            Review.is_approved == True,  # noqa: E712
            Review.rating == stars,
        )
        result = await db.execute(stmt)
        breakdown[str(stars)] = result.scalar() or 0

    return {
        "average_rating": avg_rating,
        "review_count": review_count,
        "breakdown": breakdown,
    }


# --- Stock Management ---
@router.get("/{id}/stock", response_model=List[schemas.StockItem])
async def get_stock_items(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    include_sold: bool = Query(False),
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """Get stock items for a product (Admin Only)."""
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await crud.product.get_stock_items(db, product_id=id, include_sold=include_sold)


@router.post("/{id}/stock", response_model=List[schemas.StockItem])
async def add_stock_items(
    *,
    db: AsyncSession = Depends(deps.get_db),
    id: int,
    items: List[str],
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """Add stock items (digital keys) to a product (Admin Only)."""
    product = await crud.product.get(db, id=id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Filter out empty strings
    clean_items = [item.strip() for item in items if item.strip()]
    if not clean_items:
        raise HTTPException(status_code=400, detail="No valid items provided")

    return await crud.product.add_stock_items(db, product_id=id, items=clean_items)


@router.delete("/stock/{item_id}")
async def delete_stock_item(
    *,
    db: AsyncSession = Depends(deps.get_db),
    item_id: int,
    current_user: User = Depends(deps.get_current_active_superuser),
):
    """Delete an unsold stock item (Admin Only)."""
    success = await crud.product.delete_stock_item(db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stock item not found or already sold")
    return {"ok": True}


# --- CRUD ---
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
