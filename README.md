# HealthCheckApp

A URL health monitoring tool with login verification. Monitors the availability of internal application URLs and validates login accessibility — per category, on demand or all at once.

---

## Contents

- [Prerequisites](#prerequisites)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [API reference](#api-reference)
- [Development workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git | Any | https://git-scm.com |
| Node.js *(local dev only)* | 20 LTS | https://nodejs.org |

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js 20, Express 4, Zod, Axios, Morgan, Helmet |
| Frontend | React 18, Vite, TanStack Query, CSS Modules |
| Container | Docker, nginx (frontend), Node alpine (backend) |
| Future | Kubernetes-ready — `/health` and `/ready` probes in place |

---

## Quick start

### Docker (recommended)

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/HealthCheckApp.git
cd HealthCheckApp

# 2. Create your env file
cp .env.example .env

# 3. Fill in credentials in .env, then build and run
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |

### Local development

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev

# Frontend — new terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

---


## Configuration

### Adding a new category

1. Add an entry to `backend/urls.json`:

```json
"YourApp": {
  "enabled": true,
  "timeout": 5000,
  "urls": [
    "https://yourapp.com/dashboard",
    "https://yourapp.com/settings"
  ],
  "login": {
    "url": "https://yourapp.com/api/auth/login",
    "method": "POST",
    "env_username_key": "LOGIN_CREDENTIALS_YOURAPP_USERNAME",
    "env_password_key": "LOGIN_CREDENTIALS_YOURAPP_PASSWORD",
    "successCriteria": {
      "statuses": [200, 204],
      "responseIncludes": "Welcome"
    }
  }
}
```

2. Add credentials to `.env`:

```bash
LOGIN_CREDENTIALS_YOURAPP_USERNAME=your-username
LOGIN_CREDENTIALS_YOURAPP_PASSWORD=your-password
```

3. Restart the backend.

> Login is optional — omit the `login` block entirely for URL-only monitoring.
> Set `"enabled": false` to temporarily disable a category without removing it.

### Environment variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Backend port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `API_KEY` | No | — | If set, all requests must include `x-api-key` header |
| `CORS_ORIGIN` | Yes | `http://localhost:5173` | Comma-separated allowed origins |
| `LOG_FORMAT` | No | `dev` | `dev` (human) or `combined` (structured) |
| `CHECK_TIMEOUT_MS` | No | `5000` | Per-URL request timeout |
| `CHECK_CONCURRENCY` | No | `5` | Max parallel category checks |
| `VITE_API_URL` | Yes | `http://localhost:3000` | Backend URL used by the browser |

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Liveness probe — always returns 200 |
| GET | `/ready` | No | Readiness probe — 503 if config not loaded |
| GET | `/api/v1/categories` | Yes* | List all categories with metadata |
| GET | `/api/v1/check/:category` | Yes* | Full health + login check for one category |
| GET | `/api/v1/check-all` | Yes* | Full check for all enabled categories |

*Auth required only when `API_KEY` is set in `.env`.

### Response — single category check

```json
{
  "category": "AdminPanel",
  "status": "green",
  "checkedAt": "2026-04-28T10:00:00.000Z",
  "durationMs": 312,
  "urls": [
    { "url": "https://...", "healthy": true, "status": 200, "latencyMs": 145 },
    { "url": "https://...", "healthy": false, "status": null, "error": "timeout", "latencyMs": 5001 }
  ],
  "login": {
    "success": true,
    "status": 200,
    "reason": null
  }
}
```

**Status values:** `green` (all OK) · `orange` (partial failure or login failed) · `red` (all URLs down)

---

## License

MIT