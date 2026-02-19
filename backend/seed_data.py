import asyncio
import asyncpg
from app.core.config import settings

async def seed_data():
    dsn = f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_SERVER}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
    print(f"Connecting to {dsn.replace(settings.POSTGRES_PASSWORD, '***')} ...")
    
    try:
        conn = await asyncpg.connect(dsn)
        print("Connected!")
        
        # Clear existing data? Maybe not, just append or ignore conflicts.
        # Let's clear for a clean state if user wants to see "test data".
        print("Cleaning up old data...")
        await conn.execute("TRUNCATE TABLE store_products RESTART IDENTITY CASCADE")
        
        print("Seeding Products...")
        products = [
            ("Elden Ring", 1200.0, "Gaming", "Steam", "manual", "Best RPG", True, 5),
            ("Netflix 1 Month", 150.0, "Streaming", "Netflix", "auto", "4K Ultra HD", True, 100),
            ("Spotify", 60.0, "Streaming", "Spotify", "manual", "Premium", True, 0)
        ]
        
        for p in products:
            # (name, price, category, subcategory, delivery_type, description, is_active, stock_count_target)
            target_stock = p[7] 
            
            # Insert Product
            row = await conn.fetchrow(
                """
                INSERT INTO store_products (name, price, category, subcategory, delivery_type, description, is_active)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
                """,
                p[0], p[1], p[2], p[3], p[4], p[5], p[6]
            )
            pid = row['id']
            
            # Insert Stock Items
            if target_stock > 0:
                print(f"  Adding {target_stock} items for {p[0]}...")
                items_data = [(pid, f"content_{i}", False) for i in range(target_stock)]
                await conn.executemany(
                    """
                    INSERT INTO store_items (product_id, content, is_sold)
                    VALUES ($1, $2, $3)
                    """,
                    items_data
                )
            
        print("Seeding Users...")
        # Create a test admin user? Password hashing is complex here.
        # We can insert a user without a password (if nullable) or skip for now.
        # User auth flow uses Google, so we might not need to seed users unless we mock auth.
        
        print("Done! Data seeded.")
        await conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(seed_data())
