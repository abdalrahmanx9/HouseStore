import asyncio
from app.db.session import AsyncSessionLocal
from app.models.order import Order
from sqlalchemy import select


async def check_orders():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        print(f"Total Orders Found: {len(orders)}")
        for o in orders:
            print(
                f"ID: {o.id}, Status: {o.status}, Amount: {o.amount}, Proof: {o.payment_proof_url}"
            )


if __name__ == "__main__":
    asyncio.run(check_orders())
