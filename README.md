# HealthCheckApp

A production-grade URL health monitoring tool with login verification, built on Node.js + Express (backend) and React + Vite (frontend).


## Quick start (Docker)

```bash
cp .env.example .env        # fill in your values
docker compose up --build
```

Frontend → http://localhost:5173  
Backend API → http://localhost:3000

## Quick start (local)

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run dev

# Frontend (new terminal)
cd frontend && cp .env.example .env && npm install && npm run dev
```

## Configuration

All monitored URLs and login configs live in `backend/urls.json`.  
See `backend/urls.json` for the full schema and an example entry.  
All secrets (credentials, API keys) go in `backend/.env` — never in `urls.json`.

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

## Adding a new category

1. Add an entry to `backend/urls.json` following the existing schema.
2. Add the corresponding credential env vars to `backend/.env`.
3. Restart the backend (or it hot-reloads in dev).

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness probe |
| GET | /ready | Readiness probe |
| GET | /api/v1/categories | List all categories |
| GET | /api/v1/check/:category | Full check for one category |
| GET | /api/v1/check-all | Full check for all categories |