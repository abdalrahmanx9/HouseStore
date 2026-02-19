import asyncio
import asyncpg
from app.core.config import settings

async def create_database():
    print(f"Connecting to {settings.POSTGRES_SERVER}...")
    try:
        # Connect to default 'postgres' database to create new db
        sys_conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            database='postgres'
        )
        try:
            exists = await sys_conn.fetchval(f"SELECT 1 FROM pg_database WHERE datname = '{settings.POSTGRES_DB}'")
            if not exists:
                await sys_conn.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
                print(f"Database {settings.POSTGRES_DB} created.")
            else:
                print(f"Database {settings.POSTGRES_DB} already exists.")
        finally:
            await sys_conn.close()
    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    asyncio.run(create_database())
