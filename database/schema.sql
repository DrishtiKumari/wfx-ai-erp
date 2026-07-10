-- WFX AI ERP — PostgreSQL Schema (v2)
-- Matches the actual deployed schema on Supabase
-- Run this in Supabase SQL Editor to create all tables

CREATE TABLE IF NOT EXISTS buyers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100),
    buyer_category VARCHAR(100),
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL UNIQUE,
    country VARCHAR(100),
    contact_person VARCHAR(255),
    lead_time_days INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    specialization VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    city VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS finished_goods (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(50) NOT NULL UNIQUE,
    style_name TEXT,
    category VARCHAR(100),
    fabric VARCHAR(255),
    gsm INTEGER,
    color VARCHAR(100),
    print VARCHAR(100),
    season VARCHAR(100),
    brand VARCHAR(100),
    supplier VARCHAR(255),
    cost DECIMAL(10, 2) DEFAULT 0,
    selling_price DECIMAL(10, 2) DEFAULT 0,
    image_url TEXT,
    size_range VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_fg_supplier FOREIGN KEY (supplier)
        REFERENCES suppliers(company_name) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    buyer VARCHAR(255),
    style_number VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    unit_price DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) DEFAULT 0,
    order_date DATE,
    shipment_date DATE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_so_buyer FOREIGN KEY (buyer)
        REFERENCES buyers(company_name) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_so_style FOREIGN KEY (style_number)
        REFERENCES finished_goods(style_number) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sales_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    sales_order VARCHAR(50),
    buyer VARCHAR(255),
    amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    tax DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(12, 2) DEFAULT 0,
    invoice_date DATE,
    due_date DATE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_si_order FOREIGN KEY (sales_order)
        REFERENCES sales_orders(order_number) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_si_buyer FOREIGN KEY (buyer)
        REFERENCES buyers(company_name) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tech_packs (
    id SERIAL PRIMARY KEY,
    style_number VARCHAR(50),
    fabric_details TEXT,
    construction TEXT,
    wash_instructions TEXT,
    measurements TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT fk_tp_style FOREIGN KEY (style_number)
        REFERENCES finished_goods(style_number) ON UPDATE CASCADE ON DELETE SET NULL
);
