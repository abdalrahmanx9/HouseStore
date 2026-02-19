import asyncio
from app.db.session import engine
from app.models.base import Base
# Import all models to ensure metadata is populated
from app.models.user import User
from app.models.product import Product
from app.models.order import Order

async def reset_db():
    print("Dropping all tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Tables recreated.")

if __name__ == "__main__":
    asyncio.run(reset_db())
