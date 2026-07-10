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
    const error = await response.json().catch(() => ({
      detail: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(error.detail || `Request failed: ${response.status}`);
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
  // Filters endpoint doesn't exist on deployed backend,
  // so we return empty defaults
  return {
    categories: [],
    fabrics: [],
    suppliers: [],
    colors: [],
    seasons: [],
    price_min: 0,
    price_max: 10000,
  };
}

// ── AI API ───────────────────────────────────────────────────────────────────

export async function askQuestion(question: string) {
  return request<NLQueryResponse>("/query/", {
    method: "POST",
    body: JSON.stringify({ question }),
  });
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
