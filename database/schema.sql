-- WFX AI ERP — PostgreSQL Schema
-- Run this in Supabase SQL Editor to create all tables

-- ============================================================
-- Table: buyers
-- Description: Customer companies that purchase finished goods
-- ============================================================
CREATE TABLE IF NOT EXISTS buyers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Table: suppliers
-- Description: Companies that supply raw materials or manufacture goods
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    specialization VARCHAR(255),
    lead_time_days INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- Table: finished_goods
-- Description: Product catalog — styles, fabrics, categories, prices
-- ============================================================
CREATE TABLE IF NOT EXISTS finished_goods (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    supplier VARCHAR(255),
    fabric VARCHAR(255),
    color VARCHAR(100),
    size_range VARCHAR(100),
    season VARCHAR(100),
    price DECIMAL(10, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Relationship: supplier references suppliers.company_name
    CONSTRAINT fk_finished_goods_supplier
        FOREIGN KEY (supplier) REFERENCES suppliers(company_name)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- Table: sales_orders
-- Description: Purchase orders placed by buyers
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer VARCHAR(255),
    style_number VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    order_date DATE,
    delivery_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Relationship: buyer references buyers.company_name
    CONSTRAINT fk_sales_orders_buyer
        FOREIGN KEY (buyer) REFERENCES buyers(company_name)
        ON UPDATE CASCADE ON DELETE SET NULL,

    -- Relationship: style_number references finished_goods.style_number
    CONSTRAINT fk_sales_orders_style
        FOREIGN KEY (style_number) REFERENCES finished_goods(style_number)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- Table: sales_invoices
-- Description: Invoices generated for sales orders
-- ============================================================
CREATE TABLE IF NOT EXISTS sales_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    sales_order VARCHAR(50),
    buyer VARCHAR(255),
    amount DECIMAL(12, 2) DEFAULT 0,
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    invoice_date DATE,
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Relationship: sales_order references sales_orders.order_number
    CONSTRAINT fk_sales_invoices_order
        FOREIGN KEY (sales_order) REFERENCES sales_orders(order_number)
        ON UPDATE CASCADE ON DELETE SET NULL,

    -- Relationship: buyer references buyers.company_name
    CONSTRAINT fk_sales_invoices_buyer
        FOREIGN KEY (buyer) REFERENCES buyers(company_name)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- ============================================================
-- Table: tech_packs
-- Description: Technical specifications for product manufacturing
-- ============================================================
CREATE TABLE IF NOT EXISTS tech_packs (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(50),
    description TEXT,
    fabric_details TEXT,
    measurements TEXT,
    construction_notes TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Relationship: style_number references finished_goods.style_number
    CONSTRAINT fk_tech_packs_style
        FOREIGN KEY (style_number) REFERENCES finished_goods(style_number)
        ON UPDATE CASCADE ON DELETE SET NULL
);
