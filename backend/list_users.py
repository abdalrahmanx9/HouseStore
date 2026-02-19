import os
import asyncio
import asyncpg
from app.core.config import settings

async def list_users():
    print("--- Environment Variables ---")
    for key in os.environ:
        if key.startswith("POSTGRES"):
            print(f"{key}: {os.environ[key]}")
    print("----------------------------")

    dsn = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    print(f"Direct AsyncPG Connection: {dsn}")
    
    conn = await asyncpg.connect(dsn)
    try:
        users = await conn.fetch("SELECT * FROM users")
        print(f"Found {len(users)} users (asyncpg).")
        for u in users:
            print(dict(u))

        products = await conn.fetch("SELECT * FROM store_products")
        print(f"Found {len(products)} products (asyncpg).")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(list_users())
