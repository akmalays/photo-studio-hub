## API Server (Railway-friendly)

This project is primarily a Vite frontend, but it also includes a small Node/Express API server in `server/`
that uses Supabase for database/auth operations.

### Local run

1. Create a server env file (example):

```bash
cp .env.example .env.local
```

2. Start the API server:

```bash
npm run dev:api
```

### Endpoints

- `GET /health`
- `POST /api/admin/users` (requires `Authorization: Bearer <access_token>`)
- `POST /api/contact`

### Environment variables (server)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
- `LOVABLE_API_KEY` (optional, used for email sending)
- `PORT` (optional, defaults to 8080)
- `CORS_ORIGIN` (optional, defaults to `*`; can be comma-separated origins)

### Railway deploy (API only)

- **Build command**: `npm install && npm run build:api`
- **Start command**: `npm run start:api`

Set the env vars above in Railway.

