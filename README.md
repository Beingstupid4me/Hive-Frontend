# Hive Frontend (Next.js)

This frontend is wired to the FastAPI backend in `../AI-backend` through an internal proxy route:

- Frontend requests: `/api/hive/*`
- Proxy target: `${HIVE_BACKEND_URL}/api/*`

The proxy keeps the UI host/port configurable through env vars and avoids hardcoded backend URLs across components.

## Environment Configuration

Copy `.env.example` to `.env.local` and adjust values:

```bash
cp .env.example .env.local
```

Variables:

- `HIVE_BACKEND_URL`: Backend base URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_HIVE_PROXY_PREFIX`: Frontend proxy prefix (default: `/api/hive`)

## Local Development

1. Start backend:

```bash
cd ../AI-backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. Start frontend:

```bash
cd ../frontend
npm install
npm run dev
```

3. Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://localhost:8000/docs`

## Notes

- Terminal desks and marketing pages are backend-driven.
- Contact submit, execution order submit, optimizer solve, and agent query actions are connected to backend endpoints.
- If backend is unavailable, frontend pages fall back to local safe defaults and continue rendering.
