import asyncio
import asyncpg
from app.core.config import settings

async def check():
    print(f"Testing connection to {settings.POSTGRES_SERVER} as {settings.POSTGRES_USER}...")
    try:
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            database="storedb"
        )
        print("Connection successful to 'storedb'!")
        
        # Check permissions
        try:
             await conn.execute("CREATE DATABASE test_db_temp")
             await conn.execute("DROP DATABASE test_db_temp")
             print("User has CREATE DATABASE permission.")
        except Exception as e:
             print(f"User properly connected but CANNOT create databases: {e}")

        await conn.close()
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(check())
