# KemisPay – Railway Deployment

Deploy KemisPay to [Railway](https://railway.app) and connect it to your GitHub repo.

## 1. Connect repo

1. In [Railway](https://railway.app), create a new project.
2. Choose **Deploy from GitHub repo** and select `salutethegenius/kemispay` (or your fork).
3. Railway will detect the Node app and use `railway.toml` for build/start.

## 2. Add a Postgres database (Railway or Supabase)

- **Option A – Railway Postgres:** In the same project, add a Postgres plugin. Railway sets `DATABASE_URL` for the service.
- **Option B – Supabase:** Create a Postgres project in [Supabase](https://supabase.com), use the **Session pooler** connection string (port 6543), and set `DATABASE_URL` in Railway variables.

## 3. Required environment variables

Set these in the Railway service **Variables** tab (no quotes in the UI):

| Variable | Description |
|----------|-------------|
| `NODE_ENV` | `production` (Railway often sets this) |
| `PORT` | Set by Railway automatically |
| `DATABASE_URL` | Postgres connection string (Session pooler if Supabase) |
| `CLIENT_URL` | Your app URL, e.g. `https://kemispay.up.railway.app` |
| `TRANSAK_API_KEY` | From [Transak Dashboard](https://docs.transak.com) |
| `TRANSAK_ACCESS_TOKEN` | For webhook verification (Transak) |
| `TRANSAK_BASE_URL` | `https://global.transak.com` (prod) or `https://global-stg.transak.com` (staging) |
| `KEMISPAY_CUSTODY_WALLET_ADDRESS` | Ethereum address (0x + 40 hex) where USDC is received |
| `SUPABASE_URL` | Supabase project URL (KYC storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (KYC storage) |

Optional: `AUTO_WITHDRAWAL_LIMIT_USD`, `WITHDRAWAL_DAILY_CAP_USD`, AWS SES vars for email.

## 4. Transak webhook

After the first deploy, set the webhook URL in the Transak dashboard to:

```text
https://<your-railway-domain>/api/transak/webhook
```

Use the public URL Railway gives your service (e.g. `*.up.railway.app` or your custom domain).

## 5. Database schema

Run migrations or push schema once (from your machine or a one-off Railway run):

```bash
# From repo root, with DATABASE_URL set
npm run db:push
```

Use the same `DATABASE_URL` as in Railway (e.g. from Railway’s Variables or a linked Postgres plugin).

## 6. Build and start

- **Build:** `npm run build` (Vite client + esbuild server bundle).
- **Start:** `npm start` runs `node dist/index.js` and serves API + static client.

Railway runs the build, then the start command, and injects `PORT`; the app listens on `0.0.0.0:PORT`.

## 7. Custom domain (optional)

In Railway, open your service → **Settings** → **Networking** → **Custom Domain**, add your domain and follow the DNS instructions. Then set `CLIENT_URL` and the Transak webhook URL to that domain.
