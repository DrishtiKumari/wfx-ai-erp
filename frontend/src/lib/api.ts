/**
 * API client — all backend communication goes through here.
 * Uses fetch with proper error handling and base URL from env.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined | null>;
}

/**
 * Generic fetch wrapper with error handling.
 */
async function request<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
    ...fetchOptions,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const error = await response.json();
      if (typeof error.detail === "string") {
        message = error.detail;
      } else if (Array.isArray(error.detail)) {
        message = error.detail.map((e: { msg?: string }) => e.msg || JSON.stringify(e)).join(", ");
      } else if (error.detail) {
        message = JSON.stringify(error.detail);
      } else if (error.message) {
        message = typeof error.message === "string" ? error.message : JSON.stringify(error.message);
      }
    } catch {
      message = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(message);
  }

  return response.json();
}

// ── Dashboard API ────────────────────────────────────────────────────────────

export async function getDashboardData() {
  return request<DashboardResponse>("/dashboard/");
}

// Legacy functions that now derive from the single dashboard endpoint
export async function getDashboardStats() {
  const data = await getDashboardData();
  return {
    total_products: data.total_products,
    total_buyers: data.total_buyers,
    total_suppliers: data.total_suppliers,
    total_orders: data.total_orders,
    total_revenue: data.total_revenue,
    pending_invoices: data.total_invoices,
    top_buyer: data.buyer_mix?.[0]?.name || null,
    top_supplier: null,
  };
}

export async function getRevenueByBuyer(limit = 10) {
  const data = await getDashboardData();
  return (data.buyer_mix || []).slice(0, limit).map((item) => ({
    buyer: item.name,
    revenue: item.value,
    order_count: 0,
  }));
}

export async function getOrdersByStatus() {
  return [] as OrderStatusItem[];
}

export async function getProductsByCategory() {
  return [] as ProductCategoryItem[];
}

export async function getTopSuppliers(limit = 10) {
  return [] as TopSupplierItem[];
}

// ── Products API ─────────────────────────────────────────────────────────────

export async function getProducts(params: ProductListParams = {}) {
  return request<ProductListResponse>("/products", {
    params: params as Record<string, string | number | undefined>,
  });
}

export async function getProduct(styleNumber: string) {
  return request<ProductItem>(`/products/${encodeURIComponent(styleNumber)}`);
}

export async function searchProducts(params: ProductSearchParams = {}) {
  return request<ProductListResponse>("/products/search", {
    params: params as Record<string, string | number | undefined>,
  });
}

export async function getProductFilters(): Promise<ProductFilters> {
  // Known filter values from the deployed dataset (1000 products)
  return {
    categories: [
      "Dress", "Hoodie", "Jacket", "Jeans", "Polo", "Shirt",
      "Shorts", "Skirt", "Sweatshirt", "Trousers", "T-Shirt"
    ],
    fabrics: [
      "100% Cotton", "Chambray", "Chino Twill", "Cotton Canvas",
      "Cotton Fleece", "Cotton Pique", "Cotton Slub", "Cotton Twill",
      "Cotton Voile", "Cotton/Linen 70/30", "Cotton/Polyester 60/40",
      "Cotton/Polyester Fleece 80/20", "Cotton/Spandex 95/5",
      "Denim 10oz", "Denim 12oz", "Denim 14oz", "French Terry",
      "Linen", "Loopback Cotton", "Nylon Ripstop", "Nylon Taslan",
      "Organic Cotton", "Oxford Cotton", "Poly/Viscose Suiting",
      "Polyester Crepe", "Polyester Pique", "Polyester Shell",
      "Rayon Challis", "Stretch Denim 98/2", "Viscose"
    ],
    suppliers: [
      "ABC Textiles", "Colombo Apparel Group", "Dhaka Knitwear Ltd",
      "Guangzhou Weave Co", "Hanoi Stitch Co", "Istanbul Denim House",
      "Jakarta Garmindo", "Karachi Textile Mills", "Noida Knits Pvt Ltd",
      "Phnom Penh Sewing Ltd", "Shenzhen Fashion Works", "Tirupur Garments Co"
    ],
    colors: [
      "Beige", "Black", "Blue", "Brown", "Charcoal", "Coral",
      "Grey Melange", "Indigo", "Lavender", "Maroon", "Mustard",
      "Navy", "Off White", "Olive", "Pink", "Plum", "Red",
      "Sky Blue", "Teal"
    ],
    seasons: ["AW25", "AW26", "SS25", "SS26"],
    price_min: 0,
    price_max: 5000,
  };
}

// ── AI API ───────────────────────────────────────────────────────────────────

interface RawQueryResponse {
  question: string;
  sql: string;
  results: Record<string, unknown>[];
  explanation: string;
  confidence: number;
  exec_time_ms: number;
}

export async function askQuestion(question: string): Promise<NLQueryResponse> {
  const raw = await request<RawQueryResponse>("/query/", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
  // Map deployed API response to frontend's expected shape
  return {
    question: raw.question,
    sql: raw.sql || "",
    rows: raw.results || [],
    answer: raw.explanation || "No explanation available.",
    confidence: (raw.confidence || 0) / 100, // API returns 0-100, frontend expects 0-1
  };
}

export async function explainResult(data: ExplainRequest) {
  return request<ExplainResponse>("/ai/explain-result", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ── Types (imported from types.ts in usage, defined here for the API layer) ──

import type {
  DashboardResponse,
  RevenueBuyerItem,
  OrderStatusItem,
  ProductCategoryItem,
  TopSupplierItem,
  ProductItem,
  ProductListResponse,
  ProductListParams,
  ProductSearchParams,
  ProductFilters,
  NLQueryResponse,
  ExplainRequest,
  ExplainResponse,
} from "./types";
