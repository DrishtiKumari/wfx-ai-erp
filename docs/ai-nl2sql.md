# AI & NL2SQL Documentation

> WFX AI ERP — Natural Language to SQL Pipeline

---

## Overview

The NL2SQL (Natural Language to SQL) system allows business users to ask questions in plain English and receive accurate data from the ERP database. The system converts questions into safe SQL, executes them, and generates human-readable answers.

---

## How It Works

### Pipeline Steps

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. User      │     │ 2. Prompt    │     │ 3. LLM       │
│ Question     │────▶│ Construction │────▶│ Generation   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 6. Answer    │     │ 5. Execute   │     │ 4. SQL       │
│ Generation   │◀────│ Query        │◀────│ Validation   │
└──────────────┘     └──────────────┘     └──────────────┘
        │
        ▼
┌──────────────┐
│ 7. Return    │
│ Response     │
└──────────────┘
```

---

## Step 1: User Question

The user submits a plain English business question through the UI.

**Examples:**
- "Which buyer generated the highest revenue?"
- "How many orders are pending this month?"
- "What is the most popular fabric type?"
- "Show me all products from supplier Textile Corp"
- "What is the average order value by buyer?"

---

## Step 2: Prompt Construction

The system builds a structured prompt that includes:

1. **System context**: Database schema description with table names, columns, and relationships
2. **Safety instructions**: Rules for the LLM to follow (SELECT only, use LIMIT, etc.)
3. **Few-shot examples**: 3-5 examples of question → SQL pairs
4. **User question**: The actual question from the user

### Schema Context Provided to LLM

```
Tables available:
- buyers (id, company_name, contact_person, email, phone, country, city, address, payment_terms, credit_limit, status)
- suppliers (id, company_name, contact_person, email, phone, country, city, specialization, lead_time_days, rating, status)
- finished_goods (id, style_number, description, category, supplier, fabric, color, size_range, season, price, status)
- sales_orders (id, order_number, buyer, style_number, quantity, unit_price, total_amount, order_date, delivery_date, status)
- sales_invoices (id, invoice_number, sales_order, buyer, amount, tax, total, invoice_date, due_date, payment_status)
- tech_packs (id, style_number, description, fabric_details, measurements, construction_notes, status)

Relationships:
- finished_goods.supplier → suppliers.company_name
- sales_orders.buyer → buyers.company_name
- sales_orders.style_number → finished_goods.style_number
- sales_invoices.sales_order → sales_orders.order_number
- tech_packs.style_number → finished_goods.style_number
```

---

## Step 3: LLM Generation

- Model: Configurable via `OPENROUTER_MODEL` env var
- Default: `meta-llama/llama-3.1-8b-instruct:free`
- API: OpenRouter (multi-model gateway)
- Temperature: 0.1 (low for deterministic SQL output)
- Max tokens: 500

---

## Step 4: SQL Validation

Before execution, generated SQL goes through strict validation:

### Allowed
- ✅ SELECT statements
- ✅ JOIN, WHERE, GROUP BY, ORDER BY, HAVING
- ✅ Aggregate functions (COUNT, SUM, AVG, MIN, MAX)
- ✅ LIMIT clause (auto-added if missing)
- ✅ Only the 6 known ERP tables

### Blocked
- ❌ INSERT, UPDATE, DELETE
- ❌ DROP, ALTER, TRUNCATE
- ❌ CREATE, GRANT, REVOKE
- ❌ Multiple statements (semicolon-separated)
- ❌ Comments (-- or /* */)
- ❌ System tables or pg_catalog references
- ❌ Unknown table names

### Auto-corrections
- If no LIMIT clause: add `LIMIT 100`
- Trailing semicolons: removed
- Leading/trailing whitespace: trimmed

---

## Step 5: Query Execution

- Validated SQL is executed against Supabase PostgreSQL
- Connection uses application-level credentials (not service role)
- Query timeout: 10 seconds maximum
- Results capped at configured LIMIT

---

## Step 6: Answer Generation

After receiving query results, a second LLM call generates a business answer:

**Input to LLM:**
- Original user question
- Generated SQL (for context)
- Result rows (up to 20 rows sent for answer generation)

**Output:**
- Natural language answer summarizing the results
- Confidence score (0.0 - 1.0) based on:
  - Whether results were returned
  - How well the SQL matches the question
  - Result set size and relevance

---

## Step 7: Response

Final response returned to frontend:

```json
{
  "question": "Which buyer generated the highest revenue?",
  "sql": "SELECT buyer, SUM(total_amount) as revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 10;",
  "rows": [...],
  "answer": "Fashion House Inc generated the highest revenue...",
  "confidence": 0.85
}
```

---

## Supported Question Types

| Category | Example |
|----------|---------|
| Aggregation | "What is the total revenue?" |
| Ranking | "Top 5 buyers by order count" |
| Filtering | "Show orders from buyer X" |
| Comparison | "Compare revenue across buyers" |
| Counting | "How many products in category Tops?" |
| Time-based | "Orders placed in January 2024" |
| Relationship | "Which supplier provides the most products?" |

---

## Error Handling

| Error Type | User Message |
|------------|--------------|
| SQL validation fails | "I couldn't generate a safe query for that question. Please try rephrasing." |
| LLM timeout | "The AI service is temporarily unavailable. Please try again." |
| No results | "No data found for your question. The query was valid but returned no rows." |
| DB error | "There was a database error. Please try a simpler question." |
| Invalid question | "I couldn't understand that question. Try asking about buyers, products, orders, or suppliers." |

---

## Security Considerations

1. **No write access**: SQL validator enforces SELECT-only
2. **Table allowlist**: Only queries against known tables pass
3. **No injection risk**: LLM output is validated, not directly interpolated
4. **Credential isolation**: DB credentials never exposed to frontend or LLM
5. **Result limits**: Prevents memory exhaustion from large result sets
6. **Timeout enforcement**: Prevents long-running queries from blocking
