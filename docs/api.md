# API Documentation

> WFX AI ERP — Backend API Reference

---

## Base URL

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:8000` |
| Production | _To be updated after deployment_ |

---

## Authentication

Currently no authentication required (public read-only ERP explorer).
Future: API key or JWT-based auth can be added.

---

## Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/dashboard/stats` | Overall KPI statistics |
| GET | `/dashboard/revenue-by-buyer` | Revenue breakdown by buyer |
| GET | `/dashboard/orders-by-status` | Order count by status |
| GET | `/dashboard/products-by-category` | Product count by category |
| GET | `/dashboard/top-suppliers` | Top suppliers by order volume |
| GET | `/products` | List products (paginated) |
| GET | `/products/{style_number}` | Get single product details |
| GET | `/products/search` | Search products with filters |
| GET | `/products/filters` | Get available filter options |
| POST | `/ai/nlq` | Natural language query |
| POST | `/ai/explain-result` | AI explanation of results |

---

## Health

### GET /health

Returns service health status.

**Response:**
```json
{
  "status": "healthy",
  "service": "wfx-ai-erp-backend",
  "version": "1.0.0"
}
```

---

## Dashboard Endpoints

### GET /dashboard/stats

Returns aggregate KPI metrics.

**Response:**
```json
{
  "total_products": 150,
  "total_buyers": 25,
  "total_suppliers": 30,
  "total_orders": 200,
  "total_revenue": 1500000.00,
  "pending_invoices": 15,
  "top_buyer": "Fashion House Inc",
  "top_supplier": "Textile Corp"
}
```

### GET /dashboard/revenue-by-buyer

**Response:**
```json
[
  { "buyer": "Fashion House Inc", "revenue": 500000.00 },
  { "buyer": "Style Co", "revenue": 350000.00 }
]
```

### GET /dashboard/orders-by-status

**Response:**
```json
[
  { "status": "completed", "count": 120 },
  { "status": "pending", "count": 50 },
  { "status": "cancelled", "count": 30 }
]
```

### GET /dashboard/products-by-category

**Response:**
```json
[
  { "category": "Tops", "count": 45 },
  { "category": "Dresses", "count": 30 }
]
```

### GET /dashboard/top-suppliers

**Response:**
```json
[
  { "supplier": "Textile Corp", "order_count": 50 },
  { "supplier": "Fabric World", "order_count": 35 }
]
```

---

## Product Endpoints

### GET /products

List products with pagination and sorting.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page |
| sort_by | string | "style_number" | Sort column |
| sort_order | string | "asc" | Sort direction (asc/desc) |

**Response:**
```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 20,
  "total_pages": 8
}
```

### GET /products/{style_number}

Get details for a single product.

**Response:**
```json
{
  "style_number": "STY-001",
  "description": "Summer Floral Dress",
  "category": "Dresses",
  "supplier": "Textile Corp",
  "fabric": "Cotton",
  "color": "Blue",
  "size_range": "S-XL",
  "price": 45.99
}
```

### GET /products/search

Search products with keyword and filters.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Keyword search term |
| category | string | Filter by category |
| fabric | string | Filter by fabric type |
| supplier | string | Filter by supplier |
| color | string | Filter by color |
| season | string | Filter by season |
| min_price | float | Minimum price |
| max_price | float | Maximum price |
| page | int | Page number |
| limit | int | Items per page |

### GET /products/filters

Returns available filter options for the UI.

**Response:**
```json
{
  "categories": ["Tops", "Dresses", "Bottoms"],
  "fabrics": ["Cotton", "Silk", "Polyester"],
  "suppliers": ["Textile Corp", "Fabric World"],
  "colors": ["Blue", "Red", "Black"],
  "seasons": ["Spring 2024", "Fall 2024"]
}
```

---

## AI Endpoints

### POST /ai/nlq

Natural language to SQL query execution.

**Request:**
```json
{
  "question": "Which buyer generated the highest revenue?"
}
```

**Response:**
```json
{
  "question": "Which buyer generated the highest revenue?",
  "sql": "SELECT buyer, SUM(total_amount) as revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 10;",
  "rows": [
    { "buyer": "Fashion House Inc", "revenue": 500000.00 }
  ],
  "answer": "Fashion House Inc generated the highest revenue at $500,000 across all their orders.",
  "confidence": 0.85
}
```

**Error Response (unsafe SQL):**
```json
{
  "error": "Query validation failed",
  "detail": "Only SELECT queries are allowed. Detected: DELETE",
  "safe": false
}
```

### POST /ai/explain-result

Generate AI explanation for a set of results.

**Request:**
```json
{
  "question": "What are the top 5 products by price?",
  "sql": "SELECT * FROM finished_goods ORDER BY price DESC LIMIT 5;",
  "rows": [...]
}
```

**Response:**
```json
{
  "explanation": "The top 5 most expensive products are all premium silk dresses...",
  "confidence": 0.90
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error type",
  "detail": "Human-readable explanation"
}
```

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 404 | Resource not found |
| 422 | Unprocessable entity (invalid input) |
| 500 | Internal server error |

---

## Rate Limits

No rate limits currently applied. For production, consider:
- 100 requests/minute for dashboard APIs
- 20 requests/minute for AI endpoints (LLM cost control)

---

## CORS

Backend allows requests from:
- `http://localhost:3000` (local development)
- Frontend production URL (after deployment)
