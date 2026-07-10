/**
 * Shared TypeScript types — mirrors backend Pydantic schemas.
 */

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_products: number;
  total_buyers: number;
  total_suppliers: number;
  total_orders: number;
  total_revenue: number;
  pending_invoices: number;
  top_buyer: string | null;
  top_supplier: string | null;
}

export interface RevenueBuyerItem {
  buyer: string;
  revenue: number;
  order_count: number;
}

export interface OrderStatusItem {
  status: string;
  count: number;
}

export interface ProductCategoryItem {
  category: string;
  count: number;
}

export interface TopSupplierItem {
  supplier: string;
  product_count: number;
}

// ── Products ─────────────────────────────────────────────────────────────────

export interface ProductItem {
  id?: number;
  style_number: string;
  style_name?: string;
  description?: string;
  category?: string;
  supplier?: string;
  fabric?: string;
  gsm?: number;
  color?: string;
  print?: string;
  season?: string;
  brand?: string;
  cost?: number;
  selling_price?: number;
  size_range?: string;
  status?: string;
  image_url?: string;
}

export interface ProductListResponse {
  products: ProductItem[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  category?: string;
  fabric?: string;
  supplier?: string;
  color?: string;
  season?: string;
  status?: string;
  min_price?: number;
  max_price?: number;
}

export interface ProductSearchParams {
  q?: string;
  page?: number;
  limit?: number;
  category?: string;
  fabric?: string;
  supplier?: string;
  color?: string;
  season?: string;
  min_price?: number;
  max_price?: number;
}

export interface ProductFilters {
  categories: string[];
  fabrics: string[];
  suppliers: string[];
  colors: string[];
  seasons: string[];
  price_min: number;
  price_max: number;
}

// ── AI ───────────────────────────────────────────────────────────────────────

export interface NLQueryResponse {
  question: string;
  sql: string;
  rows: Record<string, unknown>[];
  answer: string;
  confidence: number;
  error?: boolean;
}

export interface ExplainRequest {
  question: string;
  sql: string;
  rows: Record<string, unknown>[];
}

export interface ExplainResponse {
  explanation: string;
  confidence: number;
}
