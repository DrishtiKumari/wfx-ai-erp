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

WFX AI ERP is a full-stack AI-native platform that enables business users to explore ERP data using natural language. Users can:

- Browse and filter finished goods / products
- Ask business questions in plain English
- Watch those questions get converted to safe SQL
- View live query results with AI-generated insights
- Analyze business performance through a visual dashboard

Built as a skills assessment for the WFX AI Intern program.

---

## ✨ Features

### Dashboard
- KPI cards: total products, buyers, suppliers, orders, revenue
- Revenue by buyer chart
- Orders by status chart
- Products by category chart
- Top suppliers chart

### Product Explorer
- Table/card view of finished goods
- Search, filter, sort, paginate
- Product detail drawer

### AI Query (NL2SQL)
- Natural language question input
- Generated SQL display (read-only, safe)
- Result table
- AI-generated business answer
- SQL safety validation

### Product Search
- Keyword + multi-filter search
- Filter by category, fabric, supplier, buyer, color, season, price

### Documentation
- Architecture, API, AI safety, deployment guides

---

## 🛠 Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Frontend   | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Recharts |
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
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── routes/
│   │   ├── services/
│   │   ├── schemas/
│   │   └── utils/
│   ├── scripts/
│   │   └── import_csv.py
│   ├── requirements.txt
│   ├── render.yaml
│   └── .env.example
├── frontend/                 # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── .env.example
├── database/                 # SQL schema and queries
│   ├── schema.sql
│   ├── indexes.sql
│   └── sample_queries.sql
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
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=
```

### Frontend (`frontend/.env.example`)

```env
NEXT_PUBLIC_API_URL=
```

> ⚠️ Never commit real `.env` files. Use `.env.example` as templates.

---

## 🗄 Database Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_ANON_KEY`

### 2. Run Schema

```sql
-- In Supabase SQL editor, run:
-- database/schema.sql
-- database/indexes.sql
```

### 3. Import CSV Data

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Fill in your credentials
python scripts/import_csv.py
```

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
cp .env.example .env.local   # Add your backend URL
npm run dev
```

Frontend available at: `http://localhost:3000`

---

## 🚢 Deployment

See [`docs/deployment.md`](docs/deployment.md) for full deployment instructions.

| Service | Platform | Config File     |
|---------|----------|-----------------|
| Backend | Render   | `render.yaml`   |
| Frontend | Vercel  | auto-detected   |

---

## 📹 Demo

_Demo video link — to be added_

See [`docs/demo-script.md`](docs/demo-script.md) for the walkthrough script.

---

## 🔐 Security

- Only `SELECT` queries are executed from NL2SQL
- SQL validator blocks all write/DDL operations
- No credentials are ever stored in code or committed to Git
- API keys are passed via environment variables only

---

## 📄 License

Built for WFX AI Intern Skill Test. All rights reserved.
