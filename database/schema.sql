-- ============================================================================
-- Mini ERP + CRM Operations Portal
-- PostgreSQL Database Schema
-- ============================================================================
-- Execute against a fresh PostgreSQL database:
--   psql -U <user> -d <dbname> -f schema.sql
-- ============================================================================

-- Enable UUID generation (built-in since PostgreSQL 13)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_role AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');

CREATE TYPE customer_type AS ENUM ('Retail', 'Wholesale', 'Distributor');

CREATE TYPE customer_status AS ENUM ('Lead', 'Active', 'Inactive');

CREATE TYPE movement_type AS ENUM ('IN', 'OUT');

CREATE TYPE challan_status AS ENUM ('Draft', 'Confirmed', 'Cancelled');

-- ============================================================================
-- TABLE: users
-- ============================================================================
-- Internal employees who operate the ERP/CRM portal.
-- Roles govern access to different modules.
-- ============================================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(255)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    role            user_role       NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

-- Index: fast lookup by email (login)
CREATE INDEX idx_users_email ON users (email);

-- ============================================================================
-- TABLE: customers
-- ============================================================================
-- Customer master data for the wholesale/distribution business.
-- Supports Lead → Active → Inactive lifecycle.
-- ============================================================================

CREATE TABLE customers (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name   VARCHAR(200)    NOT NULL,
    mobile_number   VARCHAR(20),
    email           VARCHAR(255),
    business_name   VARCHAR(200),
    gst_number      VARCHAR(20),
    customer_type   customer_type   NOT NULL DEFAULT 'Retail',
    address         TEXT,
    status          customer_status NOT NULL DEFAULT 'Lead',
    follow_up_date  DATE,
    notes           TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

-- Indexes: customer search and filtering
CREATE INDEX idx_customers_customer_name  ON customers (customer_name);
CREATE INDEX idx_customers_mobile_number  ON customers (mobile_number);
CREATE INDEX idx_customers_email          ON customers (email);

-- ============================================================================
-- TABLE: customer_followups
-- ============================================================================
-- Stores individual follow-up records per customer.
-- One customer → many follow-ups (history).
-- ============================================================================

CREATE TABLE customer_followups (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id     UUID        NOT NULL,
    note            TEXT        NOT NULL,
    follow_up_date  DATE        NOT NULL,
    created_by      UUID        NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_followups_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_followups_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT
);

-- Indexes: lookup by customer, lookup by creator
CREATE INDEX idx_followups_customer_id ON customer_followups (customer_id);
CREATE INDEX idx_followups_created_by  ON customer_followups (created_by);

-- ============================================================================
-- TABLE: products
-- ============================================================================
-- Product catalogue with inventory tracking fields.
-- current_stock is the live count, updated by stock movements.
-- minimum_stock_quantity is the reorder threshold.
-- ============================================================================

CREATE TABLE products (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name            VARCHAR(200)    NOT NULL,
    sku                     VARCHAR(50)     NOT NULL,
    category                VARCHAR(100),
    unit_price              NUMERIC(12, 2)  NOT NULL DEFAULT 0,
    current_stock           INTEGER         NOT NULL DEFAULT 0,
    minimum_stock_quantity  INTEGER         NOT NULL DEFAULT 0,
    warehouse_location      VARCHAR(100),
    created_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT chk_products_unit_price           CHECK (unit_price >= 0),
    CONSTRAINT chk_products_current_stock        CHECK (current_stock >= 0),
    CONSTRAINT chk_products_minimum_stock_qty    CHECK (minimum_stock_quantity >= 0)
);

-- Indexes: SKU lookup, product name search
CREATE INDEX idx_products_sku          ON products (sku);
CREATE INDEX idx_products_product_name ON products (product_name);

-- ============================================================================
-- TABLE: stock_movements
-- ============================================================================
-- Complete audit trail of every stock change.
-- IN = stock received into warehouse.
-- OUT = stock dispatched or consumed.
-- ============================================================================

CREATE TABLE stock_movements (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID            NOT NULL,
    quantity        INTEGER         NOT NULL,
    movement_type   movement_type   NOT NULL,
    reason          TEXT,
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_movements_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_movements_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_movements_quantity CHECK (quantity > 0)
);

-- Indexes: product lookup, time-range queries
CREATE INDEX idx_movements_product_id ON stock_movements (product_id);
CREATE INDEX idx_movements_created_at ON stock_movements (created_at);

-- ============================================================================
-- TABLE: challans
-- ============================================================================
-- Sales/delivery challans issued to customers.
-- Lifecycle: Draft → Confirmed → (optionally Cancelled).
-- Stock is reduced only upon Confirmed status (handled by backend logic).
-- ============================================================================

CREATE TABLE challans (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_number  VARCHAR(50)     NOT NULL,
    customer_id     UUID            NOT NULL,
    total_quantity  INTEGER         NOT NULL DEFAULT 0,
    status          challan_status  NOT NULL DEFAULT 'Draft',
    created_by      UUID            NOT NULL,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_challans_challan_number UNIQUE (challan_number),
    CONSTRAINT chk_challans_total_quantity CHECK (total_quantity >= 0),

    CONSTRAINT fk_challans_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE RESTRICT,

    CONSTRAINT fk_challans_created_by
        FOREIGN KEY (created_by) REFERENCES users (id)
        ON DELETE RESTRICT
);

-- Indexes: challan number lookup, customer lookup, time-range queries
CREATE INDEX idx_challans_challan_number ON challans (challan_number);
CREATE INDEX idx_challans_customer_id    ON challans (customer_id);
CREATE INDEX idx_challans_created_at     ON challans (created_at);

-- ============================================================================
-- TABLE: challan_items
-- ============================================================================
-- Line items on a challan.
--
-- PRODUCT SNAPSHOT DESIGN:
-- In addition to product_id (FK), this table stores product_name, sku, and
-- unit_price as they were at the time the challan was created. This ensures
-- historical accuracy: if the product master is later updated (name, SKU, or
-- price change), existing challans retain the original values.
-- ============================================================================

CREATE TABLE challan_items (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    challan_id      UUID            NOT NULL,
    product_id      UUID            NOT NULL,
    product_name    VARCHAR(200)    NOT NULL,
    sku             VARCHAR(50)     NOT NULL,
    unit_price      NUMERIC(12, 2)  NOT NULL,
    quantity        INTEGER         NOT NULL,

    CONSTRAINT chk_challan_items_quantity   CHECK (quantity > 0),
    CONSTRAINT chk_challan_items_unit_price CHECK (unit_price >= 0),

    CONSTRAINT fk_challan_items_challan
        FOREIGN KEY (challan_id) REFERENCES challans (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_challan_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE RESTRICT
);

-- Indexes: challan lookup, product lookup
CREATE INDEX idx_challan_items_challan_id ON challan_items (challan_id);
CREATE INDEX idx_challan_items_product_id ON challan_items (product_id);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
