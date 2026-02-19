from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.crud.base import CRUDBase
from app.models.product import Product, StockItem
from app.schemas.product import ProductCreate, ProductUpdate

class CRUDProduct(CRUDBase[Product, ProductCreate, ProductUpdate]):
    async def get_active(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[Product]:
        """Get only active products"""
        stmt = (
            select(Product)
            .where(Product.is_active == True)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()
    
    async def get_stock_count(self, db: AsyncSession, product_id: int) -> int:
        stmt = select(func.count(StockItem.id)).where(
            StockItem.product_id == product_id,
            StockItem.is_sold == False
        )
        result = await db.execute(stmt)
        return result.scalar_one() or 0

product = CRUDProduct(Product)
