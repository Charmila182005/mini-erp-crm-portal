-- ============================================================================
-- Mini ERP + CRM Operations Portal
-- PostgreSQL Seed Data
-- ============================================================================
-- Execute AFTER schema.sql:
--   psql -U <user> -d <dbname> -f seed.sql
-- ============================================================================
-- All password hashes are bcrypt ($2b$10$) — generated with cost factor 10.
-- Plaintext passwords are documented ONLY for demo purposes and must NEVER
-- be stored in the database.
--
-- Demo credentials:
--   admin@erp.com      / Admin@123
--   sales@erp.com      / Sales@123
--   warehouse@erp.com  / Warehouse@123
--   accounts@erp.com   / Accounts@123
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- USERS (4 demo users)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO users (id, name, email, password_hash, role) VALUES
(
    'a0000000-0000-0000-0000-000000000001',
    'Admin User',
    'admin@erp.com',
    '$2b$10$LmsHwRECRf8rq.29ttETRukuZWjfVYtWmZYxdYHXltBmRd8MKR6ly',
    'ADMIN'
),
(
    'a0000000-0000-0000-0000-000000000002',
    'Sales User',
    'sales@erp.com',
    '$2b$10$Mv.9hobPIsVWw8zkq64xeu.iCPSKBS3z3lIcNE2saBIT9iSep.XO6',
    'SALES'
),
(
    'a0000000-0000-0000-0000-000000000003',
    'Warehouse User',
    'warehouse@erp.com',
    '$2b$10$bFoF49uluUBjkBXYn.TEu.tpUklrFmJq/SnL3oVQI.YjTYqkfSXPm',
    'WAREHOUSE'
),
(
    'a0000000-0000-0000-0000-000000000004',
    'Accounts User',
    'accounts@erp.com',
    '$2b$10$QG6YSAEZaRC.K87KvbwGTeaSesbl.fpJV4ZwlZ5bNjPkOeaTanijq',
    'ACCOUNTS'
);

-- ────────────────────────────────────────────────────────────────────────────
-- CUSTOMERS (5 customers)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO customers (id, customer_name, mobile_number, email, business_name, gst_number, customer_type, address, status, follow_up_date, notes) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Rajesh Kumar',
    '9876543210',
    'rajesh@techmart.in',
    'TechMart Electronics',
    '29ABCDE1234F1Z5',
    'Wholesale',
    '12 MG Road, Bengaluru, Karnataka 560001',
    'Active',
    '2026-09-20',
    'Key wholesale account. Orders monthly.'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Priya Sharma',
    '9123456780',
    'priya@globaltraders.in',
    'Global Traders Pvt Ltd',
    '07FGHIJ5678K2L3',
    'Distributor',
    '45 Nehru Place, New Delhi 110019',
    'Active',
    '2026-09-25',
    'Distributor covering North India region.'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Amit Patel',
    '9988776655',
    'amit.patel@email.com',
    NULL,
    NULL,
    'Retail',
    '78 SG Highway, Ahmedabad, Gujarat 380015',
    'Lead',
    '2026-09-18',
    'Interested in bulk keyboard purchase. Needs follow-up.'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Sneha Reddy',
    '9001234567',
    'sneha@compuworld.in',
    'CompuWorld Solutions',
    '36MNOPQ9012R3S4',
    'Wholesale',
    '23 Banjara Hills, Hyderabad, Telangana 500034',
    'Active',
    NULL,
    'Regular wholesale buyer. Prefers quarterly orders.'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'Vikram Singh',
    '9876012345',
    'vikram.singh@email.com',
    'Singh Retail Store',
    NULL,
    'Retail',
    '56 Civil Lines, Jaipur, Rajasthan 302006',
    'Inactive',
    NULL,
    'Previously active. No orders in last 6 months.'
);

-- ────────────────────────────────────────────────────────────────────────────
-- PRODUCTS (8 products)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO products (id, product_name, sku, category, unit_price, current_stock, minimum_stock_quantity, warehouse_location) VALUES
(
    'b0000000-0000-0000-0000-000000000001',
    'Mechanical Keyboard',
    'KB-001',
    'Peripherals',
    2500.00,
    150,
    20,
    'Rack A1'
),
(
    'b0000000-0000-0000-0000-000000000002',
    'Wireless Mouse',
    'MS-001',
    'Peripherals',
    800.00,
    300,
    50,
    'Rack A2'
),
(
    'b0000000-0000-0000-0000-000000000003',
    'USB-C Hub 7-Port',
    'HB-001',
    'Accessories',
    1200.00,
    80,
    15,
    'Rack B1'
),
(
    'b0000000-0000-0000-0000-000000000004',
    '24-inch LED Monitor',
    'MN-001',
    'Displays',
    12000.00,
    45,
    10,
    'Rack C1'
),
(
    'b0000000-0000-0000-0000-000000000005',
    'Laptop Stand Aluminium',
    'LS-001',
    'Accessories',
    1800.00,
    120,
    25,
    'Rack B2'
),
(
    'b0000000-0000-0000-0000-000000000006',
    'Cat6 Ethernet Cable 3m',
    'CB-001',
    'Cables',
    150.00,
    500,
    100,
    'Rack D1'
),
(
    'b0000000-0000-0000-0000-000000000007',
    'Webcam 1080p',
    'WC-001',
    'Peripherals',
    3500.00,
    60,
    10,
    'Rack A3'
),
(
    'b0000000-0000-0000-0000-000000000008',
    'Surge Protector 6-Socket',
    'SP-001',
    'Power',
    650.00,
    200,
    30,
    'Rack D2'
);

-- ────────────────────────────────────────────────────────────────────────────
-- CUSTOMER FOLLOW-UPS (6 records)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO customer_followups (customer_id, note, follow_up_date, created_by) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'Discussed quarterly pricing for keyboards and monitors. Will send revised quote by Friday.',
    '2026-09-15',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'c0000000-0000-0000-0000-000000000001',
    'Quote sent. Rajesh confirmed interest. Follow up next week for order confirmation.',
    '2026-09-20',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'Priya requested distribution pricing for peripherals. Needs catalog with MOQs.',
    '2026-09-12',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Initial inquiry via phone. Amit wants 50 keyboards for office setup. Sent product details.',
    '2026-09-10',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'Follow-up call. Amit is comparing with two other vendors. Offered 5% discount on bulk.',
    '2026-09-18',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'Sneha placed verbal order for monitors and laptop stands. Awaiting formal PO.',
    '2026-09-14',
    'a0000000-0000-0000-0000-000000000002'
);

-- ────────────────────────────────────────────────────────────────────────────
-- STOCK MOVEMENTS (10 records — initial stocking and some outbound)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO stock_movements (product_id, quantity, movement_type, reason, created_by) VALUES
-- Initial inbound stock for Mechanical Keyboard
(
    'b0000000-0000-0000-0000-000000000001',
    150,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for Wireless Mouse
(
    'b0000000-0000-0000-0000-000000000002',
    300,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for USB-C Hub
(
    'b0000000-0000-0000-0000-000000000003',
    80,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for LED Monitor
(
    'b0000000-0000-0000-0000-000000000004',
    45,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for Laptop Stand
(
    'b0000000-0000-0000-0000-000000000005',
    120,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for Ethernet Cable
(
    'b0000000-0000-0000-0000-000000000006',
    500,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for Webcam
(
    'b0000000-0000-0000-0000-000000000007',
    60,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Initial inbound stock for Surge Protector
(
    'b0000000-0000-0000-0000-000000000008',
    200,
    'IN',
    'Initial stock received from supplier',
    'a0000000-0000-0000-0000-000000000003'
),
-- Sample outbound: 10 keyboards dispatched
(
    'b0000000-0000-0000-0000-000000000001',
    10,
    'OUT',
    'Sample dispatch to TechMart Electronics',
    'a0000000-0000-0000-0000-000000000003'
),
-- Sample outbound: 25 mice dispatched
(
    'b0000000-0000-0000-0000-000000000002',
    25,
    'OUT',
    'Bulk dispatch to Global Traders',
    'a0000000-0000-0000-0000-000000000003'
);

-- ────────────────────────────────────────────────────────────────────────────
-- CHALLANS (2 sample challans)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO challans (id, challan_number, customer_id, total_quantity, status, created_by) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'CHL-2026-0001',
    'c0000000-0000-0000-0000-000000000001',
    15,
    'Draft',
    'a0000000-0000-0000-0000-000000000002'
),
(
    'd0000000-0000-0000-0000-000000000002',
    'CHL-2026-0002',
    'c0000000-0000-0000-0000-000000000002',
    30,
    'Draft',
    'a0000000-0000-0000-0000-000000000002'
);

-- ────────────────────────────────────────────────────────────────────────────
-- CHALLAN ITEMS (product snapshots at time of challan creation)
-- ────────────────────────────────────────────────────────────────────────────

-- Challan CHL-2026-0001: 10 keyboards + 5 mice = 15 total
INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity) VALUES
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    'Mechanical Keyboard',
    'KB-001',
    2500.00,
    10
),
(
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000002',
    'Wireless Mouse',
    'MS-001',
    800.00,
    5
);

-- Challan CHL-2026-0002: 20 ethernet cables + 10 surge protectors = 30 total
INSERT INTO challan_items (challan_id, product_id, product_name, sku, unit_price, quantity) VALUES
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000006',
    'Cat6 Ethernet Cable 3m',
    'CB-001',
    150.00,
    20
),
(
    'd0000000-0000-0000-0000-000000000002',
    'b0000000-0000-0000-0000-000000000008',
    'Surge Protector 6-Socket',
    'SP-001',
    650.00,
    10
);

-- ============================================================================
-- NOTE: The sample challans above are in 'Draft' status. Stock is NOT reduced
-- for drafts. Stock reduction happens only when a challan is Confirmed, which
-- will be handled by backend transaction logic in a later phase.
-- ============================================================================
