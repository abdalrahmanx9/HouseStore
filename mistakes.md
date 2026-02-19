# Mistakes Log

This file tracks lessons learned and mistakes made during development to avoid repeating them.

| Date | Mistake | Solution/Prevention |
|------|---------|---------------------|
|      | `uv` not found on Windows | Use standard `venv` and `pip`. |
|      | `asyncpg` connection failure to `localhost` | Use `127.0.0.1` to force IPv4. |
|      | `ModuleNotFoundError: No module named 'app'` in pytest | Add `pythonpath = .` to `pytest.ini`. |
|      | `RuntimeError` in pytest-asyncio | Conflict with custom `event_loop` fixture; remove it and let `pytest-asyncio` handle it. |
|      | `ProgrammingError` in `seed_data.py` (SQLAlchemy) | Use raw `asyncpg` or investigate driver/container version mismatch. For now, rely on `debug_asyncpg.py` for verification. |
|      |         |                     |
