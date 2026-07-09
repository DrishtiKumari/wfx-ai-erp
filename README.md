# WFX AI ERP — Intelligent ERP Exploration Platform

> An AI-native ERP analytics platform for the apparel and fashion industry, powered by natural language queries, real-time dashboards, and a safe NL2SQL engine.

---

## 🚀 Live Links

| Service     | URL                              |
|-------------|----------------------------------|
| Frontend    | _To be updated after deployment_ |
| Backend API | _To be updated after deployment_ |
| API Docs    | _To be updated after deployment_ |

---

## 📋 Project Overview

WFX AI ERP is a full-stack AI-native platform that enables business users to explore ERP data using natural language. Built for the apparel/fashion industry, it allows users to:

- Browse and filter finished goods / products
- Ask business questions in plain English
- Watch those questions get converted to safe SQL
- View live query results with AI-generated insights
- Analyze business performance through visual dashboards

Built as a skills assessment for the WFX AI Intern program.

---

## ✨ Features

### 📊 Dashboard
- KPI cards: total products, buyers, suppliers, orders, revenue, pending invoices
- Revenue by buyer bar chart
- Orders by status donut chart
- Products by category bar chart
- Top suppliers horizontal bar chart

### 📦 Product Explorer
- Sortable table view of finished goods (8 columns)
- Server-side filtering by category and supplier
- Client-side keyword search
- Clickable rows open detail side panel
- Pagination with page controls

### 🤖 AI Query (NL2SQL)
- Natural language question input
- 6 clickable example questions
- Generated SQL displayed in dark code block
- Copy SQL to clipboard
- Dynamic result table with formatted values
- AI-generated business answer with confidence score
- Safety notice explaining read-only restrictions

### 🔍 Product Search
- Full-text keyword search across 6 fields
- 7 advanced filters (category, fabric, supplier, color, season, min/max price)
- Collapsible filter panel with active count badge
- Product cards in 3-column responsive grid
- Clear all filters button

### 📄 Documentation Page
- Interactive architecture diagram
- Tech stack overview
- AI safety visualization (allowed vs blocked)
- NL2SQL pipeline steps
- Database schema summary
- Deployment links table

---

## 🛠 Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts |
| Backend    | FastAPI, Python 3.11, SQLAlchemy, Pydantic       |
| Database   | Supabase (PostgreSQL)                            |
| AI         | OpenRouter API (LLM-based NL2SQL + answers)      |
| Deploy FE  | Vercel                                           |
| Deploy BE  | Render                                           |

---

## 🏗 Architecture

```
User Browser
    │
    ▼
Next.js Frontend (Vercel)
    │  REST API calls
    ▼
FastAPI Backend (Render)
    │               │
    ▼               ▼
Supabase       OpenRouter API
PostgreSQL     (LLM / NL2SQL)
```

See [`docs/architecture.md`](docs/architecture.md) for full details.

---

## 📁 Project Structure

```
wfx-ai-erp/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # App entry point
│   │   ├── config.py         # Environment config
│   │   ├── database.py       # DB connection
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic
│   │   └── schemas/          # Pydantic models
│   ├── scripts/
│   │   └── import_csv.py     # Data import tool
│   ├── requirements.txt
│   ├── render.yaml
│   ├── Procfile
│   └── .env.example
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # UI components
│   │   └── lib/              # API client & types
│   ├── vercel.json
│   ├── package.json
│   └── .env.example
├── database/                 # SQL schema and queries
│   ├── schema.sql
│   ├── indexes.sql
│   └── sample_queries.sql
├── data/                     # Sample CSV data
│   ├── buyers.csv
│   ├── suppliers.csv
│   ├── finished_goods.csv
│   ├── sales_orders.csv
│   ├── sales_invoices.csv
│   └── tech_packs.csv
├── docs/                     # Project documentation
│   ├── architecture.md
│   ├── api.md
│   ├── ai-nl2sql.md
│   ├── deployment.md
│   └── demo-script.md
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env.example`)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODEL=meta-llama/llama-3.1-8b-instruct:free
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.example`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> ⚠️ Never commit real `.env` files. Use `.env.example` as templates.

---

## 🗄 Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`

### 2. Run Schema

In Supabase SQL Editor, run these files in order:
```sql
-- 1. Create tables
-- Run: database/schema.sql

-- 2. Create indexes
-- Run: database/indexes.sql
```

### 3. Import CSV Data

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in your credentials
python scripts/import_csv.py --data-dir ../data --run-schema
```

The import script handles:
- Foreign key ordering (buyers/suppliers first, then dependent tables)
- Column normalization
- Idempotent imports (safe to re-run)

---

## 🔧 Running the Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# or: source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
cp .env.example .env         # Add your credentials
uvicorn app.main:app --reload --port 8000
```

Backend available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

---

## 💻 Running the Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # Set NEXT_PUBLIC_API_URL
npm run dev
```

Frontend available at: `http://localhost:3000`

---

## 🚢 Deployment

### Frontend → Vercel
1. Import repo on [vercel.com](https://vercel.com)
2. Set Root Directory: `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL` = your Render backend URL

### Backend → Render
1. Create Web Service on [render.com](https://render.com)
2. Set Root Directory: `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add all env vars from `.env.example`

See [`docs/deployment.md`](docs/deployment.md) for full step-by-step instructions.

---

## 🔐 Security

- Only `SELECT` queries are executed from NL2SQL
- SQL validator blocks INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE
- Only 6 known ERP tables are queryable
- Auto-LIMIT prevents unbounded result sets
- No credentials stored in code or committed to Git
- API keys passed via environment variables only
- Security headers configured on frontend

---

## 📹 Demo

_Demo video link — to be added_

See [`docs/demo-script.md`](docs/demo-script.md) for the 5-7 minute walkthrough.

---

## 📄 License

Built for WFX AI Intern Skill Test. All rights reserved.
