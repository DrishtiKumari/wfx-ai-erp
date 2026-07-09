# Architecture Overview

> WFX AI ERP — System Architecture & Design Decisions

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   NEXT.JS FRONTEND (Vercel)                      │
│                                                                  │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌───────────────┐  │
│  │Dashboard │ │Product       │ │AI Query  │ │Product Search │  │
│  │Page      │ │Explorer Page │ │Page      │ │Page           │  │
│  └──────────┘ └──────────────┘ └──────────┘ └───────────────┘  │
│                                                                  │
│  Components: shadcn/ui · Recharts · Tailwind CSS                │
└───────────────────────────────┬─────────────────────────────────┘
                                │  REST API (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   FASTAPI BACKEND (Render)                        │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      API Routes                             │ │
│  │  /health  /dashboard/*  /products/*  /ai/nlq  /ai/explain  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Service Layer                             │ │
│  │  ProductService  DashboardService  NL2SQLService            │ │
│  │  OpenRouterService  SQLValidator                            │ │
│  └──────────────────┬──────────────────────┬──────────────────┘ │
│                     │                      │                     │
└─────────────────────┼──────────────────────┼─────────────────────┘
                      │                      │
                      ▼                      ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│   SUPABASE POSTGRESQL    │   │      OPENROUTER API          │
│                          │   │                              │
│  Tables:                 │   │  - NL → SQL generation       │
│  - buyers                │   │  - Business answer synthesis │
│  - suppliers             │   │  - Confidence scoring        │
│  - finished_goods        │   │                              │
│  - sales_orders          │   │  Model: LLaMA 3.1 / GPT     │
│  - sales_invoices        │   │                              │
│  - tech_packs            │   └──────────────────────────────┘
│                          │
└──────────────────────────┘
```

---

## Component Responsibilities

### Frontend (Next.js)

| Component | Responsibility |
|-----------|---------------|
| Dashboard Page | Display KPIs and charts from analytics APIs |
| Product Explorer | Browse, filter, sort, paginate finished goods |
| AI Query Page | Accept NL questions, show SQL + results + AI answer |
| Product Search | Multi-filter search with keyword and faceted filters |
| Layout / Sidebar | Navigation, responsive structure, consistent theming |

### Backend (FastAPI)

| Component | Responsibility |
|-----------|---------------|
| `routes/health.py` | Health check endpoint for monitoring |
| `routes/dashboard.py` | Aggregate analytics queries |
| `routes/products.py` | CRUD-like read operations for products |
| `routes/ai.py` | NL2SQL pipeline orchestration |
| `services/openrouter_service.py` | LLM API communication |
| `services/nl2sql_service.py` | Prompt construction + SQL extraction |
| `services/sql_validator.py` | SQL safety validation |
| `services/product_service.py` | Product query logic |
| `config.py` | Environment variable management |
| `database.py` | Database connection pooling |

### Database (Supabase PostgreSQL)

| Table | Purpose |
|-------|---------|
| `buyers` | Customer / buyer companies |
| `suppliers` | Raw material and manufacturing suppliers |
| `finished_goods` | Product catalog (style, category, fabric, price) |
| `sales_orders` | Purchase orders from buyers |
| `sales_invoices` | Billing / payment records |
| `tech_packs` | Technical specifications for production |

---

## Data Flow

### 1. Dashboard Flow
```
User opens Dashboard → Frontend calls GET /dashboard/* →
Backend aggregates from PostgreSQL → Returns JSON → Frontend renders charts
```

### 2. Product Explorer Flow
```
User applies filters → Frontend calls GET /products?filters →
Backend builds parameterized query → Returns paginated results →
Frontend renders table/cards
```

### 3. AI Query Flow (NL2SQL)
```
User types question → Frontend calls POST /ai/nlq →
Backend sends prompt to OpenRouter → LLM generates SQL →
SQL Validator checks safety → Execute SELECT on DB →
Send results back to LLM for business answer →
Return {sql, rows, answer, confidence} → Frontend displays all
```

### 4. Product Search Flow
```
User enters keyword + selects filters → Frontend calls GET /products/search →
Backend constructs WHERE clauses → Returns matching products →
Frontend renders filtered results
```

---

## AI Pipeline Detail

### Step 1: Prompt Construction
- System prompt provides database schema context
- User question is embedded in a structured template
- Few-shot examples guide the LLM toward correct SQL patterns

### Step 2: SQL Generation
- LLM generates a SQL query based on the question
- Response is parsed to extract the SQL block

### Step 3: SQL Validation
- Check: only SELECT allowed
- Check: no DDL/DML keywords (INSERT, UPDATE, DELETE, DROP, etc.)
- Check: only allowed table names referenced
- Check: LIMIT clause is present (add if missing, default 100)
- Check: no subqueries that could bypass safety

### Step 4: Execution
- Execute validated SQL against Supabase PostgreSQL
- Use parameterized connection with read-only intent
- Timeout after reasonable duration

### Step 5: Answer Generation
- Send original question + SQL + result rows back to LLM
- LLM generates a natural language business answer
- Include confidence score based on result quality

---

## Security Model

### SQL Safety
- **Allowlist approach**: Only `SELECT` statements pass validation
- **Blocklist keywords**: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, CREATE, GRANT, REVOKE
- **Table allowlist**: Only the 6 known ERP tables
- **Auto-LIMIT**: Prevents unbounded result sets
- **No credential exposure**: DB connection string never appears in responses

### API Security
- Environment variables for all secrets
- No secrets in codebase or Git history
- CORS configured for frontend origin only
- Input validation via Pydantic schemas

### Frontend Security
- No direct database access from client
- All data flows through backend API
- API URL is the only exposed config

---

## Technology Justifications

| Choice | Reasoning |
|--------|-----------|
| **Next.js 14** | App Router, server components, excellent DX, easy Vercel deploy |
| **TypeScript** | Type safety, better IDE support, fewer runtime errors |
| **Tailwind CSS** | Utility-first, fast iteration, consistent design system |
| **shadcn/ui** | Accessible, composable, no vendor lock-in (copy-paste components) |
| **Recharts** | React-native charting, good docs, lightweight |
| **FastAPI** | Async Python, auto-docs (Swagger), Pydantic validation, fast |
| **SQLAlchemy/asyncpg** | Reliable PostgreSQL access, async support |
| **Supabase** | Managed Postgres, easy setup, free tier, real-time capable |
| **OpenRouter** | Multi-model access, pay-per-use, model flexibility |
| **Vercel** | Zero-config Next.js hosting, global CDN |
| **Render** | Simple Python hosting, free tier, auto-deploy from Git |

---

## Deployment Architecture

```
GitHub Repository
    │
    ├── Push to main → Vercel auto-deploys frontend
    │
    └── Push to main → Render auto-deploys backend
                            │
                            └── Connects to Supabase PostgreSQL
```

| Platform | Service | Auto-Deploy |
|----------|---------|-------------|
| Vercel | Frontend (Next.js) | Yes, on push |
| Render | Backend (FastAPI) | Yes, on push |
| Supabase | Database (PostgreSQL) | Always running |

---

## Error Handling Strategy

1. **Backend**: Return structured error responses with HTTP status codes
2. **Frontend**: Display user-friendly error messages with retry options
3. **AI Pipeline**: Graceful fallback if LLM fails or SQL is invalid
4. **Database**: Connection pooling with retry logic
