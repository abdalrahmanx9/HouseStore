import asyncio
import sys
from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User

async def promote_user(email: str):
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user:
            print(f"User {email} not found.")
            return

        user.is_superuser = True
        await db.commit()
        print(f"User {email} promoted to superuser.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python promote_user.py <email>")
        sys.exit(1)
    
    email = sys.argv[1]
    asyncio.run(promote_user(email))
