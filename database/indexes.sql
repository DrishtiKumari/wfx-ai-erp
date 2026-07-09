-- WFX AI ERP — PostgreSQL Indexes
-- Run this after schema.sql to optimize query performance

-- ============================================================
-- Buyers Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_buyers_company_name ON buyers(company_name);
CREATE INDEX IF NOT EXISTS idx_buyers_country ON buyers(country);
CREATE INDEX IF NOT EXISTS idx_buyers_status ON buyers(status);

-- ============================================================
-- Suppliers Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_suppliers_company_name ON suppliers(company_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_country ON suppliers(country);
CREATE INDEX IF NOT EXISTS idx_suppliers_specialization ON suppliers(specialization);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_rating ON suppliers(rating DESC);

-- ============================================================
-- Finished Goods Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_finished_goods_style_number ON finished_goods(style_number);
CREATE INDEX IF NOT EXISTS idx_finished_goods_category ON finished_goods(category);
CREATE INDEX IF NOT EXISTS idx_finished_goods_supplier ON finished_goods(supplier);
CREATE INDEX IF NOT EXISTS idx_finished_goods_fabric ON finished_goods(fabric);
CREATE INDEX IF NOT EXISTS idx_finished_goods_color ON finished_goods(color);
CREATE INDEX IF NOT EXISTS idx_finished_goods_season ON finished_goods(season);
CREATE INDEX IF NOT EXISTS idx_finished_goods_price ON finished_goods(price);
CREATE INDEX IF NOT EXISTS idx_finished_goods_status ON finished_goods(status);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_finished_goods_category_supplier
    ON finished_goods(category, supplier);

-- ============================================================
-- Sales Orders Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_buyer ON sales_orders(buyer);
CREATE INDEX IF NOT EXISTS idx_sales_orders_style_number ON sales_orders(style_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_orders_delivery_date ON sales_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_total_amount ON sales_orders(total_amount DESC);

-- Composite index for revenue queries
CREATE INDEX IF NOT EXISTS idx_sales_orders_buyer_total
    ON sales_orders(buyer, total_amount);

-- ============================================================
-- Sales Invoices Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_sales_invoices_invoice_number ON sales_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_sales_order ON sales_invoices(sales_order);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_buyer ON sales_invoices(buyer);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_payment_status ON sales_invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_invoice_date ON sales_invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_due_date ON sales_invoices(due_date);

-- ============================================================
-- Tech Packs Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_tech_packs_style_number ON tech_packs(style_number);
CREATE INDEX IF NOT EXISTS idx_tech_packs_status ON tech_packs(status);
