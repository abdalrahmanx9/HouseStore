import pytest
from typing import AsyncGenerator
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from app.main import app
from app.api.deps import get_db
from app.core.config import settings
from app.models.base import Base


@pytest.fixture(scope="session")
def event_loop():
    import asyncio
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture(scope="function")
async def db(db_engine) -> AsyncGenerator[AsyncSession, None]:
    connection = await db_engine.connect()
    transaction = await connection.begin()
    async_session = sessionmaker(
        connection, expire_on_commit=False, class_=AsyncSession
    )
    session = async_session()

    async def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db

    yield session

    await session.close()
    await transaction.rollback()
    await connection.close()


@pytest.fixture(scope="function")
async def client(db) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()
