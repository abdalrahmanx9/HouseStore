from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.crud.base import CRUDBase
from app.models.product import Product, StockItem
from app.schemas.product import ProductCreate, ProductUpdate


class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    async def get_active(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> list:
        """Get only active products"""
        stmt = (
            select(Product)
            .where(Product.is_active == True)  # noqa: E712
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def search_products(
        self,
        db: AsyncSession,
        *,
        q: Optional[str] = None,
        category: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        sort_by: str = "newest",
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[list, int]:
        """Search/filter products with pagination metadata."""
        stmt = select(Product).where(Product.is_active == True)  # noqa: E712
        count_stmt = select(func.count(Product.id)).where(Product.is_active == True)  # noqa: E712

        if q:
            pattern = f"%{q}%"
            filter_cond = or_(
                Product.name.ilike(pattern),
                Product.description.ilike(pattern),
                Product.category.ilike(pattern),
                Product.subcategory.ilike(pattern),
            )
            stmt = stmt.where(filter_cond)
            count_stmt = count_stmt.where(filter_cond)

        if category:
            stmt = stmt.where(Product.category == category)
            count_stmt = count_stmt.where(Product.category == category)

        if min_price is not None:
            stmt = stmt.where(Product.price >= min_price)
            count_stmt = count_stmt.where(Product.price >= min_price)

        if max_price is not None:
            stmt = stmt.where(Product.price <= max_price)
            count_stmt = count_stmt.where(Product.price <= max_price)

        # Sorting
        if sort_by == "price_asc":
            stmt = stmt.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            stmt = stmt.order_by(Product.price.desc())
        elif sort_by == "name":
            stmt = stmt.order_by(Product.name.asc())
        else:  # newest (default)
            stmt = stmt.order_by(Product.id.desc())

        # Get total count
        total = (await db.execute(count_stmt)).scalar() or 0

        # Apply pagination
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        products = list(result.scalars().all())

        return products, total

    async def get_categories(self, db: AsyncSession) -> list:
        """Get all distinct categories."""
        stmt = (
            select(Product.category)
            .where(Product.is_active == True)  # noqa: E712
            .distinct()
            .order_by(Product.category)
        )
        result = await db.execute(stmt)
        return [row[0] for row in result.all()]

    async def get_related(
        self, db: AsyncSession, product_id: int, category: str, limit: int = 4
    ) -> list:
        """Get related products from the same category."""
        stmt = (
            select(Product)
            .where(
                Product.is_active == True,  # noqa: E712
                Product.category == category,
                Product.id != product_id,
            )
            .limit(limit)
        )
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def get_stock_count(self, db: AsyncSession, product_id: int) -> int:
        stmt = select(func.count(StockItem.id)).where(
            StockItem.product_id == product_id,
            StockItem.is_sold == False,  # noqa: E712
        )
        result = await db.execute(stmt)
        return result.scalar_one() or 0

    async def get_average_rating(self, db: AsyncSession, product_id: int) -> Optional[float]:
        from app.models.review import Review
        stmt = select(func.avg(Review.rating)).where(
            Review.product_id == product_id,
            Review.is_approved == True,  # noqa: E712
        )
        result = await db.execute(stmt)
        avg = result.scalar()
        return round(float(avg), 1) if avg else None

    async def get_review_count(self, db: AsyncSession, product_id: int) -> int:
        from app.models.review import Review
        stmt = select(func.count(Review.id)).where(
            Review.product_id == product_id,
            Review.is_approved == True,  # noqa: E712
        )
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def get_stock_items(
        self, db: AsyncSession, product_id: int, include_sold: bool = False
    ) -> list:
        stmt = select(StockItem).where(StockItem.product_id == product_id)
        if not include_sold:
            stmt = stmt.where(StockItem.is_sold == False)  # noqa: E712
        stmt = stmt.order_by(StockItem.added_at.desc())
        result = await db.execute(stmt)
        return list(result.scalars().all())

    async def add_stock_items(
        self, db: AsyncSession, product_id: int, items: list
    ) -> list:
        new_items = []
        for content in items:
            item = StockItem(product_id=product_id, content=content.strip())
            db.add(item)
            new_items.append(item)
        await db.commit()
        for item in new_items:
            await db.refresh(item)
        return new_items

    async def delete_stock_item(self, db: AsyncSession, item_id: int) -> bool:
        stmt = select(StockItem).where(
            StockItem.id == item_id,
            StockItem.is_sold == False,  # noqa: E712
        )
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        if not item:
            return False
        await db.delete(item)
        await db.commit()
        return True

    async def assign_stock_item(self, db: AsyncSession, product_id: int):
        """Assign an available stock item (for auto-delivery)."""
        from datetime import datetime, timezone
        stmt = (
            select(StockItem)
            .where(
                StockItem.product_id == product_id,
                StockItem.is_sold == False,  # noqa: E712
            )
            .limit(1)
        )
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        if item:
            item.is_sold = True  # type: ignore
            item.sold_at = datetime.now(timezone.utc)  # type: ignore
            db.add(item)
            await db.commit()
            await db.refresh(item)
        return item


product = CRUDProduct(Product)
