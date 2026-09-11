# Database Design — Mini ERP + CRM Operations Portal

## 1. Purpose

This PostgreSQL database supports all data storage needs for the Mini ERP + CRM Operations Portal — a wholesale/distribution company's internal tool managing customers, products, inventory, stock movements, sales challans, and CRM follow-ups.

---

## 2. Entity-Relationship Diagram

```
┌────────────┐         ┌────────────────────┐
│   users    │         │    customers       │
│────────────│         │────────────────────│
│ id (PK)    │◄──┐     │ id (PK)            │◄──────┐
│ name       │   │     │ customer_name      │       │
│ email (UQ) │   │     │ mobile_number      │       │
│ password   │   │     │ email              │       │
│ role       │   │     │ business_name      │       │
│ created_at │   │     │ gst_number         │       │
│ updated_at │   │     │ customer_type      │       │
└────────────┘   │     │ address            │       │
                 │     │ status             │       │
                 │     │ follow_up_date     │       │
                 │     │ notes              │       │
                 │     │ created_at         │       │
                 │     │ updated_at         │       │
                 │     └────────────────────┘       │
                 │                                  │
    ┌────────────┴──────────────────┐               │
    │                               │               │
    ▼                               ▼               ▼
┌────────────────────┐    ┌────────────────────────────┐
│ customer_followups │    │       challans              │
│────────────────────│    │────────────────────────────│
│ id (PK)            │    │ id (PK)                    │
│ customer_id (FK)───┼──► │ challan_number (UQ)        │
│ note               │    │ customer_id (FK)───────────┼──►
│ follow_up_date     │    │ total_quantity             │
│ created_by (FK)────┼──► │ status                     │
│ created_at         │    │ created_by (FK)────────────┼──►
└────────────────────┘    │ created_at                 │
                          │ updated_at                 │
                          └─────────────┬──────────────┘
                                        │ 1:N
                                        ▼
                          ┌────────────────────────────┐
                          │      challan_items         │
                          │────────────────────────────│
                          │ id (PK)                    │
                          │ challan_id (FK)            │
                          │ product_id (FK)────────────┼──►
                          │ product_name  (snapshot)   │     ┌──────────────────┐
                          │ sku           (snapshot)   │     │    products      │
                          │ unit_price    (snapshot)   │     │──────────────────│
                          │ quantity                   │     │ id (PK)          │
                          └────────────────────────────┘     │ product_name     │
                                                             │ sku (UQ)         │
┌──────────────────────┐                                     │ category         │
│   stock_movements    │                                     │ unit_price       │
│──────────────────────│                                     │ current_stock    │
│ id (PK)              │                                     │ min_stock_qty    │
│ product_id (FK)──────┼──────────────────────────────────►  │ warehouse_loc    │
│ quantity             │                                     │ created_at       │
│ movement_type        │                                     │ updated_at       │
│ reason               │                                     └──────────────────┘
│ created_by (FK)──────┼──►
│ created_at           │
└──────────────────────┘
```

---

## 3. Tables

### 3.1 `users`

Internal employees who access the portal.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK, DEFAULT `gen_random_uuid()` | |
| `name` | VARCHAR(100) | NOT NULL | |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash — never plaintext |
| `role` | `user_role` ENUM | NOT NULL | ADMIN, SALES, WAREHOUSE, ACCOUNTS |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.2 `customers`

Customer master data with lifecycle status tracking.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `customer_name` | VARCHAR(200) | NOT NULL | |
| `mobile_number` | VARCHAR(20) | | |
| `email` | VARCHAR(255) | | |
| `business_name` | VARCHAR(200) | | Optional — relevant for B2B |
| `gst_number` | VARCHAR(20) | | Optional |
| `customer_type` | `customer_type` ENUM | NOT NULL, DEFAULT 'Retail' | Retail, Wholesale, Distributor |
| `address` | TEXT | | |
| `status` | `customer_status` ENUM | NOT NULL, DEFAULT 'Lead' | Lead, Active, Inactive |
| `follow_up_date` | DATE | | Next scheduled follow-up |
| `notes` | TEXT | | General notes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.3 `customer_followups`

Individual CRM follow-up records. One customer can have many follow-ups, providing a full interaction history.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `customer_id` | UUID | NOT NULL, FK → `customers.id` | ON DELETE RESTRICT |
| `note` | TEXT | NOT NULL | Follow-up details |
| `follow_up_date` | DATE | NOT NULL | Date of follow-up |
| `created_by` | UUID | NOT NULL, FK → `users.id` | ON DELETE RESTRICT |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.4 `products`

Product catalogue with live inventory counts.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `product_name` | VARCHAR(200) | NOT NULL | |
| `sku` | VARCHAR(50) | NOT NULL, UNIQUE | Stock Keeping Unit |
| `category` | VARCHAR(100) | | Product category |
| `unit_price` | NUMERIC(12,2) | NOT NULL, DEFAULT 0, CHECK ≥ 0 | Price per unit |
| `current_stock` | INTEGER | NOT NULL, DEFAULT 0, CHECK ≥ 0 | Live stock count |
| `minimum_stock_quantity` | INTEGER | NOT NULL, DEFAULT 0, CHECK ≥ 0 | Reorder threshold |
| `warehouse_location` | VARCHAR(100) | | Physical location |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.5 `stock_movements`

Immutable audit trail of every stock change — inbound (IN) or outbound (OUT).

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `product_id` | UUID | NOT NULL, FK → `products.id` | ON DELETE RESTRICT |
| `quantity` | INTEGER | NOT NULL, CHECK > 0 | Always positive; direction is in `movement_type` |
| `movement_type` | `movement_type` ENUM | NOT NULL | IN or OUT |
| `reason` | TEXT | | Human-readable explanation |
| `created_by` | UUID | NOT NULL, FK → `users.id` | ON DELETE RESTRICT |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.6 `challans`

Delivery challans issued to customers.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `challan_number` | VARCHAR(50) | NOT NULL, UNIQUE | e.g. CHL-2026-0001 |
| `customer_id` | UUID | NOT NULL, FK → `customers.id` | ON DELETE RESTRICT |
| `total_quantity` | INTEGER | NOT NULL, DEFAULT 0, CHECK ≥ 0 | Sum of all item quantities |
| `status` | `challan_status` ENUM | NOT NULL, DEFAULT 'Draft' | Draft, Confirmed, Cancelled |
| `created_by` | UUID | NOT NULL, FK → `users.id` | ON DELETE RESTRICT |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | |

---

### 3.7 `challan_items`

Line items on a challan. Contains **product snapshots** — see section 7.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | UUID | PK | |
| `challan_id` | UUID | NOT NULL, FK → `challans.id` | ON DELETE CASCADE |
| `product_id` | UUID | NOT NULL, FK → `products.id` | ON DELETE RESTRICT |
| `product_name` | VARCHAR(200) | NOT NULL | **Snapshot** at creation time |
| `sku` | VARCHAR(50) | NOT NULL | **Snapshot** at creation time |
| `unit_price` | NUMERIC(12,2) | NOT NULL, CHECK ≥ 0 | **Snapshot** at creation time |
| `quantity` | INTEGER | NOT NULL, CHECK > 0 | |

---

## 4. Relationships

```
users ──┬── 1:N ── customer_followups.created_by
        ├── 1:N ── stock_movements.created_by
        └── 1:N ── challans.created_by

customers ──┬── 1:N ── customer_followups.customer_id
            └── 1:N ── challans.customer_id

products ──┬── 1:N ── stock_movements.product_id
           └── 1:N ── challan_items.product_id

challans ──── 1:N ── challan_items.challan_id
```

---

## 5. Constraints Summary

| Table | Constraint | Type | Rule |
|---|---|---|---|
| `users` | `uq_users_email` | UNIQUE | One account per email |
| `products` | `uq_products_sku` | UNIQUE | One product per SKU |
| `products` | `chk_products_unit_price` | CHECK | `unit_price >= 0` |
| `products` | `chk_products_current_stock` | CHECK | `current_stock >= 0` |
| `products` | `chk_products_minimum_stock_qty` | CHECK | `minimum_stock_quantity >= 0` |
| `stock_movements` | `chk_movements_quantity` | CHECK | `quantity > 0` |
| `challans` | `uq_challans_challan_number` | UNIQUE | One challan per number |
| `challans` | `chk_challans_total_quantity` | CHECK | `total_quantity >= 0` |
| `challan_items` | `chk_challan_items_quantity` | CHECK | `quantity > 0` |
| `challan_items` | `chk_challan_items_unit_price` | CHECK | `unit_price >= 0` |

All ENUM types (`user_role`, `customer_type`, `customer_status`, `movement_type`, `challan_status`) enforce valid values at the database level.

---

## 6. Indexes

| Table | Index | Column(s) | Rationale |
|---|---|---|---|
| `users` | `idx_users_email` | `email` | Login lookup |
| `customers` | `idx_customers_customer_name` | `customer_name` | Customer search |
| `customers` | `idx_customers_mobile_number` | `mobile_number` | Phone search |
| `customers` | `idx_customers_email` | `email` | Email search |
| `products` | `idx_products_sku` | `sku` | SKU lookup |
| `products` | `idx_products_product_name` | `product_name` | Name search |
| `stock_movements` | `idx_movements_product_id` | `product_id` | Movement history per product |
| `stock_movements` | `idx_movements_created_at` | `created_at` | Time-range queries / reports |
| `challans` | `idx_challans_challan_number` | `challan_number` | Challan lookup |
| `challans` | `idx_challans_customer_id` | `customer_id` | Challans per customer |
| `challans` | `idx_challans_created_at` | `created_at` | Time-range queries |
| `challan_items` | `idx_challan_items_challan_id` | `challan_id` | Items per challan |
| `challan_items` | `idx_challan_items_product_id` | `product_id` | Challan history per product |

---

## 7. Product Snapshot Design

> [!IMPORTANT]
> `challan_items` stores `product_name`, `sku`, and `unit_price` **as they were at challan creation time**.

### Why?

Products change over time — names are updated, SKUs are revised, prices increase. Business documents (challans) must accurately reflect what was agreed at the time they were issued.

### How it works

When creating a challan, the backend reads the current product data and copies `product_name`, `sku`, and `unit_price` into each `challan_item` row. The `product_id` FK is retained for reference, but the snapshot fields are the source of truth for the historical record.

### Example

| Event | Product Master | Challan Item (CHL-2026-0001) |
|---|---|---|
| Challan created (Sept 1) | Name: "Keyboard", SKU: KB001, Price: ₹800 | product_name: "Keyboard", sku: KB001, unit_price: 800 |
| Product updated (Oct 15) | Name: "Premium Keyboard", SKU: KB999, Price: ₹1200 | **Unchanged** — still shows "Keyboard", KB001, ₹800 |

---

## 8. Stock Movement Design

### Audit Trail

Every stock change is recorded as an immutable `stock_movements` row with:
- **product_id** — which product changed
- **quantity** — how much (always positive)
- **movement_type** — direction: `IN` (received) or `OUT` (dispatched)
- **reason** — human-readable explanation
- **created_by** — the user who performed the action
- **created_at** — exact timestamp

### Current Stock

The `products.current_stock` field holds the live count. It is updated by the backend whenever a movement is recorded:
- `IN` → `current_stock += quantity`
- `OUT` → `current_stock -= quantity`

The movement history table enables full audit and reconciliation.

---

## 9. Challan Design

### Lifecycle

```
Draft → Confirmed → (optionally Cancelled)
```

| Status | Stock Impact | Description |
|---|---|---|
| **Draft** | None | Challan is being prepared; stock untouched |
| **Confirmed** | Reduced | Stock for each item is deducted |
| **Cancelled** | None (or reversed) | Challan voided |

### ON DELETE Behavior

| FK Target | ON DELETE | Rationale |
|---|---|---|
| `challans.customer_id` → `customers` | RESTRICT | Cannot delete a customer with existing challans |
| `challans.created_by` → `users` | RESTRICT | Cannot delete the user who created challans |
| `challan_items.challan_id` → `challans` | CASCADE | Deleting a challan removes its line items |
| `challan_items.product_id` → `products` | RESTRICT | Cannot delete a product used in challans |

> [!NOTE]
> For production use, soft deletion (an `is_deleted` flag) may be preferable for customers and products to preserve all historical references. The current schema uses RESTRICT to prevent accidental data loss.

---

## 10. Why Transactions Are Needed for Challan Confirmation

> [!WARNING]
> Challan confirmation is a **multi-step atomic operation** that must use a PostgreSQL transaction.

### The problem

When a challan moves from `Draft` to `Confirmed`, the backend must:

1. Verify sufficient stock for **every** item in the challan
2. Deduct `current_stock` for each product
3. Create `stock_movements` (OUT) records for each item
4. Update the challan status to `Confirmed`

### Why a transaction is required

If any step fails (e.g., insufficient stock for item 3 of 5), **all** previous stock deductions must be rolled back. Without a transaction:

- Product A's stock could be deducted
- Product B's stock could be deducted
- Product C fails due to insufficient stock
- **Result:** Products A and B have incorrect stock counts

### Transaction guarantee

```sql
BEGIN;
  -- Check stock for all items
  -- Deduct stock for each item
  -- Create stock_movement records
  -- Update challan status to 'Confirmed'
COMMIT;
-- If any step fails → ROLLBACK — no partial updates
```

This ensures the database remains consistent regardless of failures.

---

## 11. Environment Configuration

The backend connects to PostgreSQL using the `DATABASE_URL` environment variable:

```
DATABASE_URL=postgresql://username:password@localhost:5432/mini_erp_crm
```

This value is stored in `backend/.env` (never committed) and referenced via `backend/.env.example`.
