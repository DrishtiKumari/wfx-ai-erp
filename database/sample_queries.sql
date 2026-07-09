-- WFX AI ERP — Sample Queries
-- These demonstrate the types of queries the NL2SQL engine should generate

-- ============================================================
-- Dashboard Queries
-- ============================================================

-- Total KPI stats
SELECT
    (SELECT COUNT(*) FROM finished_goods) AS total_products,
    (SELECT COUNT(*) FROM buyers) AS total_buyers,
    (SELECT COUNT(*) FROM suppliers) AS total_suppliers,
    (SELECT COUNT(*) FROM sales_orders) AS total_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM sales_orders) AS total_revenue,
    (SELECT COUNT(*) FROM sales_invoices WHERE payment_status = 'pending') AS pending_invoices;

-- Revenue by buyer (top 10)
SELECT
    buyer,
    SUM(total_amount) AS revenue,
    COUNT(*) AS order_count
FROM sales_orders
GROUP BY buyer
ORDER BY revenue DESC
LIMIT 10;

-- Orders by status
SELECT
    status,
    COUNT(*) AS count
FROM sales_orders
GROUP BY status
ORDER BY count DESC;

-- Products by category
SELECT
    category,
    COUNT(*) AS count
FROM finished_goods
GROUP BY category
ORDER BY count DESC;

-- Top suppliers by number of products
SELECT
    supplier,
    COUNT(*) AS product_count
FROM finished_goods
GROUP BY supplier
ORDER BY product_count DESC
LIMIT 10;

-- ============================================================
-- Product Explorer Queries
-- ============================================================

-- List products with pagination
SELECT
    style_number,
    description,
    category,
    supplier,
    fabric,
    color,
    size_range,
    season,
    price,
    status
FROM finished_goods
ORDER BY style_number ASC
LIMIT 20 OFFSET 0;

-- Get single product detail
SELECT *
FROM finished_goods
WHERE style_number = 'STY-001';

-- Search products by keyword
SELECT *
FROM finished_goods
WHERE
    description ILIKE '%cotton%'
    OR category ILIKE '%cotton%'
    OR fabric ILIKE '%cotton%'
ORDER BY price ASC
LIMIT 20;

-- Filter products by multiple criteria
SELECT *
FROM finished_goods
WHERE
    category = 'Dresses'
    AND fabric = 'Silk'
    AND price BETWEEN 20 AND 100
ORDER BY price ASC
LIMIT 20;

-- Get distinct filter values
SELECT DISTINCT category FROM finished_goods ORDER BY category;
SELECT DISTINCT fabric FROM finished_goods ORDER BY fabric;
SELECT DISTINCT color FROM finished_goods ORDER BY color;
SELECT DISTINCT supplier FROM finished_goods ORDER BY supplier;
SELECT DISTINCT season FROM finished_goods ORDER BY season;

-- ============================================================
-- AI / NL2SQL Example Queries
-- ============================================================

-- "Which buyer generated the highest revenue?"
SELECT
    buyer,
    SUM(total_amount) AS revenue
FROM sales_orders
GROUP BY buyer
ORDER BY revenue DESC
LIMIT 1;

-- "How many orders are pending?"
SELECT
    COUNT(*) AS pending_orders
FROM sales_orders
WHERE status = 'pending';

-- "What is the average order value by buyer?"
SELECT
    buyer,
    AVG(total_amount) AS avg_order_value,
    COUNT(*) AS order_count
FROM sales_orders
GROUP BY buyer
ORDER BY avg_order_value DESC
LIMIT 10;

-- "Show me all products from supplier Textile Corp"
SELECT
    style_number,
    description,
    category,
    fabric,
    color,
    price
FROM finished_goods
WHERE supplier = 'Textile Corp'
ORDER BY style_number
LIMIT 50;

-- "What is the most popular fabric type?"
SELECT
    fabric,
    COUNT(*) AS product_count
FROM finished_goods
GROUP BY fabric
ORDER BY product_count DESC
LIMIT 5;

-- "Which orders are overdue?"
SELECT
    order_number,
    buyer,
    style_number,
    delivery_date,
    status
FROM sales_orders
WHERE delivery_date < CURRENT_DATE
    AND status != 'completed'
ORDER BY delivery_date ASC
LIMIT 20;

-- "What is the total revenue from completed orders?"
SELECT
    SUM(total_amount) AS total_revenue
FROM sales_orders
WHERE status = 'completed';

-- "Show me invoices that are past due date"
SELECT
    invoice_number,
    buyer,
    total,
    due_date,
    payment_status
FROM sales_invoices
WHERE due_date < CURRENT_DATE
    AND payment_status = 'pending'
ORDER BY due_date ASC
LIMIT 20;

-- "Compare revenue between top 5 buyers"
SELECT
    buyer,
    SUM(total_amount) AS revenue,
    COUNT(*) AS orders,
    AVG(total_amount) AS avg_order
FROM sales_orders
GROUP BY buyer
ORDER BY revenue DESC
LIMIT 5;

-- "Which supplier has the highest rated products?"
SELECT
    s.company_name,
    s.rating,
    COUNT(fg.id) AS product_count
FROM suppliers s
LEFT JOIN finished_goods fg ON fg.supplier = s.company_name
GROUP BY s.company_name, s.rating
ORDER BY s.rating DESC
LIMIT 10;

-- ============================================================
-- Join Queries (Complex)
-- ============================================================

-- Orders with product and buyer details
SELECT
    so.order_number,
    so.buyer,
    b.country AS buyer_country,
    so.style_number,
    fg.description AS product_name,
    fg.category,
    so.quantity,
    so.total_amount,
    so.status
FROM sales_orders so
JOIN buyers b ON b.company_name = so.buyer
JOIN finished_goods fg ON fg.style_number = so.style_number
ORDER BY so.order_date DESC
LIMIT 20;

-- Invoice details with order info
SELECT
    si.invoice_number,
    si.buyer,
    so.order_number,
    so.style_number,
    fg.description AS product,
    si.total AS invoice_total,
    si.payment_status,
    si.due_date
FROM sales_invoices si
JOIN sales_orders so ON so.order_number = si.sales_order
JOIN finished_goods fg ON fg.style_number = so.style_number
ORDER BY si.due_date ASC
LIMIT 20;
