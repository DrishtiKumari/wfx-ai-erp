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

export async function getDashboardStats() {
  return request<DashboardStats>("/dashboard/stats");
}

export async function getRevenueByBuyer(limit = 10) {
  return request<RevenueBuyerItem[]>("/dashboard/revenue-by-buyer", {
    params: { limit },
  });
}

export async function getOrdersByStatus() {
  return request<OrderStatusItem[]>("/dashboard/orders-by-status");
}

export async function getProductsByCategory() {
  return request<ProductCategoryItem[]>("/dashboard/products-by-category");
}

export async function getTopSuppliers(limit = 10) {
  return request<TopSupplierItem[]>("/dashboard/top-suppliers", {
    params: { limit },
  });
}

// ── Products API ─────────────────────────────────────────────────────────────

export async function getProducts(params: ProductListParams = {}) {
  return request<ProductListResponse>("/products", { params: params as Record<string, string | number | undefined> });
}

export async function getProduct(styleNumber: string) {
  return request<ProductItem>(`/products/${encodeURIComponent(styleNumber)}`);
}

export async function searchProducts(params: ProductSearchParams = {}) {
  return request<ProductListResponse>("/products/search", { params: params as Record<string, string | number | undefined> });
}

export async function getProductFilters() {
  return request<ProductFilters>("/products/filters");
}

// ── AI API ───────────────────────────────────────────────────────────────────

export async function askQuestion(question: string) {
  return request<NLQueryResponse>("/ai/nlq", {
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
  DashboardStats,
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
