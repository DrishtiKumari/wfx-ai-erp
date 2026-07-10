/**
 * Shared TypeScript types — mirrors deployed backend API responses.
 */

// ── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardStats {
  total_products: number;
  total_buyers: number;
  total_suppliers: number;
  total_orders: number;
  total_invoices: number;
  total_revenue: number;
}

export interface RevenueChartItem {
  month: string;
  revenue: number;
}

export interface BuyerMixItem {
  name: string;
  value: number;
  color: string;
}

export interface RecentOrder {
  order_number: string;
  buyer: string;
  style_number: string;
  quantity: number;
  unit_price: number;
  shipment_date: string;
  status: string;
  buyer_name: string;
  product: string;
  total_value: number;
  ship_date: string;
  order_date: string | null;
}

export interface OperationalMetric {
  label: string;
  value: number;
  unit: string;
  color: string;
  confidence: number;
}

export interface DashboardInsight {
  intent: string;
  text: string;
  confidence: number;
}

export interface DashboardResponse {
  total_buyers: number;
  total_suppliers: number;
  total_orders: number;
  total_invoices: number;
  total_products: number;
  total_revenue: number;
  revenue_chart: RevenueChartItem[];
  buyer_mix: BuyerMixItem[];
  recent_orders: RecentOrder[];
  operational_metrics: OperationalMetric[];
  insights: DashboardInsight[];
}

// Legacy aliases for backward compatibility
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
  trend_score?: number;
  ai_demand?: string;
}

export interface ProductListResponse {
  items: ProductItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
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
  page_size?: number;
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
