# Demo Script

> WFX AI ERP — Live Demo Walkthrough (5-7 minutes)

---

## Opening (30 seconds)

"This is WFX AI ERP, an AI-native exploration platform built for the apparel industry. It allows business users to explore ERP data, ask questions in plain English, and get instant insights — all without writing SQL."

---

## Section 1: Dashboard (1 minute)

### Show

1. Open the Dashboard page
2. Point out the KPI cards:
   - Total finished goods
   - Total buyers and suppliers
   - Total orders and revenue
   - Pending invoices
3. Show the charts:
   - Revenue by buyer (bar chart)
   - Orders by status (pie chart)
   - Products by category (bar chart)
   - Top suppliers (horizontal bar)

### Say

"The dashboard gives a real-time snapshot of the business. All data comes from our Supabase PostgreSQL database through a FastAPI backend."

---

## Section 2: Product Explorer (1 minute)

### Show

1. Navigate to Product Explorer
2. Show the product table with columns
3. Apply a category filter (e.g., "Dresses")
4. Sort by price descending
5. Click on a product to show detail view
6. Show pagination

### Say

"The product explorer lets users browse the entire finished goods catalog. They can filter by category, fabric, color, supplier — and sort by any column."

---

## Section 3: AI Query — The Star Feature (2 minutes)

### Show

1. Navigate to AI Query page
2. Show the example questions
3. Type: "Which buyer generated the highest revenue?"
4. Hit submit and wait for response
5. Point out:
   - The generated SQL (read-only, visible to user)
   - The result table
   - The AI-generated business answer
   - The confidence score

### Say

"This is the core innovation. Users type a question in plain English. The system uses an LLM to convert it to safe SQL, validates it for security, executes it, and then generates a business-friendly answer."

### Follow-up query

6. Type: "Show me all orders with status pending"
7. Show results

### Say

"Notice how the SQL is always a SELECT query. Our validator blocks any write operations — INSERT, DELETE, DROP — making it completely safe for read-only exploration."

---

## Section 4: Product Search (1 minute)

### Show

1. Navigate to Product Search
2. Enter keyword "silk"
3. Add filter: Category = "Dresses"
4. Show filtered results
5. Clear filters and try another combination

### Say

"Product search combines keyword matching with faceted filters — category, fabric, supplier, color, season, and price range."

---

## Section 5: Architecture (1 minute)

### Show

1. Open the Docs/About page or architecture diagram
2. Explain the three-tier architecture

### Say

"The stack is:
- Next.js frontend on Vercel for the UI
- FastAPI backend on Render for the API and AI pipeline
- Supabase PostgreSQL for the database
- OpenRouter for LLM access

All connected through REST APIs with proper error handling and security."

---

## Section 6: Security (30 seconds)

### Say

"Security highlights:
- Only SELECT queries are ever executed
- SQL validator blocks all write/DDL operations
- No credentials in code — everything uses environment variables
- The LLM never sees database passwords
- Results are always size-limited"

---

## Closing (30 seconds)

### Say

"To summarize: WFX AI ERP demonstrates how AI can make ERP data accessible to non-technical users. It's built with production-quality architecture, proper security, and clean separation of concerns. The code is modular, well-documented, and deployed live."

---

## Backup Questions to Handle

| Question | Answer |
|----------|--------|
| "What if the AI generates wrong SQL?" | The validator catches unsafe queries and returns a friendly error asking the user to rephrase |
| "Can it handle complex joins?" | Yes, the LLM understands table relationships and generates JOINs when needed |
| "What model do you use?" | Configurable via env var, currently using LLaMA 3.1 through OpenRouter |
| "How do you prevent SQL injection?" | LLM output is validated (not interpolated), only SELECT allowed, table allowlist enforced |
| "Is this production-ready?" | Architecture is production-ready. For real production, you'd add auth, rate limiting, and caching |

---

## Demo Environment Checklist

Before demo:
- [ ] Backend is awake (hit /health to warm up free tier)
- [ ] Frontend is accessible
- [ ] Database has sample data loaded
- [ ] Test one AI query beforehand to warm up LLM
- [ ] Have backup screenshots in case of network issues
