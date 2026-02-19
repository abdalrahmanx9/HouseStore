import asyncio
import asyncpg
from app.core.config import settings

async def main():
    dsn = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    print(f"Connecting to {dsn.replace(settings.POSTGRES_PASSWORD, '***')} ...")
    try:
        conn = await asyncpg.connect(dsn)
        print("Connected!")
        version = await conn.fetchval("SELECT version()")
        print(f"DB Version: {version}")
        await conn.execute("CREATE TABLE IF NOT EXISTS test_raw (id serial PRIMARY KEY, name text)")
        await conn.execute("INSERT INTO test_raw (name) VALUES ('test')")
        print("Inserted raw data.")
        await conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
