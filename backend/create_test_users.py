import asyncio
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.core import security

async def create_users():
    async with AsyncSessionLocal() as db:
        users = [
            {
                "email": "admin@store.com",
                "password": "admin123",
                "full_name": "Admin User",
                "is_superuser": True
            },
            {
                "email": "user@store.com",
                "password": "user123",
                "full_name": "Normal User",
                "is_superuser": False
            }
        ]

        print("Creating test users...")
        for u_data in users:
            # Check if exists
            from sqlalchemy import select
            result = await db.execute(select(User).where(User.email == u_data["email"]))
            existing = result.scalar_one_or_none()
            
            if existing:
                print(f"Skipping {u_data['email']} (already exists)")
                continue

            user = User(
                email=u_data["email"],
                full_name=u_data["full_name"],
                hashed_password=security.get_password_hash(u_data["password"]),
                is_active=True,
                is_superuser=u_data["is_superuser"]
            )
            db.add(user)
            print(f"Created {u_data['email']} / {u_data['password']}")
        
        await db.commit()
        print("Done!")

if __name__ == "__main__":
    asyncio.run(create_users())
