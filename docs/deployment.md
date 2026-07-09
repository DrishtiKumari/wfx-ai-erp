# Deployment Guide

> WFX AI ERP — Production Deployment Instructions

---

## Overview

| Component | Platform | URL |
|-----------|----------|-----|
| Frontend | Vercel | _To be updated_ |
| Backend | Render | _To be updated_ |
| Database | Supabase | Managed (no deploy needed) |

---

## Prerequisites

- GitHub account with repository access
- Vercel account (free tier)
- Render account (free tier)
- Supabase project (free tier)
- OpenRouter API key

---

## 1. Database (Supabase)

### Setup Steps

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run `database/schema.sql` to create tables
4. Run `database/indexes.sql` to create indexes
5. Import CSV data using `backend/scripts/import_csv.py`

### Environment Values Needed

From Supabase Dashboard → Settings → API:
- `SUPABASE_URL`: Project URL
- `SUPABASE_ANON_KEY`: anon/public key

From Settings → Database:
- `DATABASE_URL`: Connection string (use "URI" format)

---

## 2. Backend (Render)

### Setup Steps

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Name | `wfx-ai-erp-backend` |
| Region | Oregon (US West) |
| Branch | `master` |
| Root Directory | `wfx-ai-erp/backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan | Free |

5. Add environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | From Supabase |
| `SUPABASE_URL` | From Supabase |
| `SUPABASE_ANON_KEY` | From Supabase |
| `OPENROUTER_API_KEY` | From OpenRouter |
| `OPENROUTER_MODEL` | `meta-llama/llama-3.1-8b-instruct:free` |

6. Click "Create Web Service"

### render.yaml (Auto-deploy config)

The `backend/render.yaml` file enables infrastructure-as-code deployment.

---

## 3. Frontend (Vercel)

### Setup Steps

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `wfx-ai-erp/frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

5. Add environment variables:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | Your Render backend URL (e.g., `https://wfx-ai-erp-backend.onrender.com`) |

6. Click "Deploy"

### Custom Domain (Optional)

- Go to Project Settings → Domains
- Add your custom domain
- Update DNS records as instructed

---

## 4. Post-Deployment Checklist

- [ ] Backend /health returns 200
- [ ] Frontend loads without errors
- [ ] Dashboard data populates
- [ ] Product explorer shows products
- [ ] AI query returns results
- [ ] CORS allows frontend → backend communication
- [ ] No secrets visible in browser console or network tab

---

## 5. CORS Configuration

Update backend CORS settings for production:

```python
# In app/main.py
origins = [
    "http://localhost:3000",           # Local development
    "https://your-app.vercel.app",     # Production frontend
]
```

---

## 6. Monitoring

### Render
- View logs in Dashboard → Service → Logs
- Auto-restart on crash
- Sleep after 15 min inactivity (free tier)

### Vercel
- View deployment logs in Dashboard → Deployments
- Analytics available in Dashboard → Analytics

### Supabase
- Query performance: Dashboard → Database → Query Performance
- Logs: Dashboard → Logs

---

## 7. Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend 503 | Free tier sleeping — wait ~30s for cold start |
| CORS error | Check `ALLOWED_ORIGINS` env var includes frontend URL |
| DB connection fail | Verify `DATABASE_URL` format and Supabase project status |
| AI query timeout | Check `OPENROUTER_API_KEY` and model availability |
| Frontend build fail | Check `NEXT_PUBLIC_API_URL` is set correctly |
| No data on dashboard | Run `python scripts/import_csv.py --data-dir ../data` |
| Import script fails | Ensure schema is created first: `--run-schema` flag |

---

## 8. Cost Estimates (Free Tier)

| Service | Free Tier Limits |
|---------|-----------------|
| Vercel | 100GB bandwidth, serverless functions |
| Render | 750 hours/month, sleeps after inactivity |
| Supabase | 500MB database, 2GB bandwidth |
| OpenRouter | Pay-per-token (free models available) |

All services used in this project fit within free tier limits for demo/assessment purposes.
