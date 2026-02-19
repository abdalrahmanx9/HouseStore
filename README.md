# StoreWeb

A secure, high-performance web store for selling digital products. Built with FastAPI (Backend) and React (Frontend).

## Features
- Independent Database
- Google OAuth2 Authentication
- Rate Limiting & Security Hardening
- Admin Dashboard
- User Order Tracking

## Setup
## Quick Start Guide (for Developers)

## Quick Start Guide (for Developers)

### 1. Run with Docker (Recommended)
We use Docker Compose to run the entire stack (Database + Backend + Frontend).

**Prerequisites:**
1.  Docker Desktop installed and running.
2.  Setup `.env` in `backend/` (see `docs/google_oauth.md` for API keys).

**Start:**
```powershell
docker compose up --build
```

- **API:** `http://127.0.0.1:8000`
- **Docs:** `http://127.0.0.1:8000/docs`
- **DB:** Port `5433`

### 2. Google OAuth Setup
Follow the [Google OAuth Setup Guide](docs/google_oauth.md) to get your credentials.


### 3. Frontend (React)
*Coming Soon in Phase 5...*

