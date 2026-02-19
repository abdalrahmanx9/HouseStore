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
| 2026-02-19 | **Frontend Crash (White Screen)** | Missing `export default` in `SupportWidget.tsx`. Always ensure components have correct exports. |
| 2026-02-19 | **Hardcoded Redirects** | Login explicitly redirected to `/dashboard`, breaking Admin flow. Use role-based routing contexts. |
| 2026-02-19 | **Git Pathspec Errors** | Tried to stage non-existent files (`backend/app/models/message.py`). Check file structure before committing. |
| 2026-02-19 | **Infinite Loading / Redirect Loops** | API Trailing Slashes mismatch between Frontend (`/api/v1/orders/`) and Backend (`/api/v1/orders`). Standardize on NO trailing slashes. |
| 2026-02-19 | **Broken Dashboard Links** | Sidebar links pointed to wrong routes or 404s. Verify nav paths early. |
| 2026-02-19 | **Verification Assumption** | Assumed `admin@example.com` login would work without verifying password in `seed.py`. Always check seed data for credentials. |
