# Architecture — Mini ERP + CRM Operations Portal

## High-Level Architecture

```
┌─────────────────────────────────────────┐
│           React Frontend                │
│  (Vite · TypeScript · CSS · HTML)       │
│                                         │
│  Pages / Components / Hooks / Context   │
└──────────────────┬──────────────────────┘
                   │
                   │  HTTPS / REST (JSON)
                   │  Authorization: Bearer <JWT>
                   ▼
┌─────────────────────────────────────────┐
│           Express REST API              │
│  (Node.js · TypeScript · Express)       │
│                                         │
│  Routes → Middleware → Controllers      │
│          ↓                              │
│      Services (Business Logic)          │
│          ↓                              │
│      Repositories (Data Access)         │
└──────────────────┬──────────────────────┘
                   │
                   │  SQL (pg / node-postgres)
                   ▼
┌─────────────────────────────────────────┐
│          PostgreSQL Database            │
│                                         │
│  Tables: users, customers, products,    │
│  inventory, stock_movements, challans,  │
│  crm_followups                          │
└─────────────────────────────────────────┘
```

---

## Request Lifecycle

```
Browser Request
    │
    ▼
React Component (triggers API call)
    │
    ▼
API Service Layer (Axios / fetch)
    │
    ▼  HTTP Request + JWT Header
Express Router
    │
    ▼
Auth Middleware (verifyToken + checkRole)
    │
    ▼
Controller (validates input, calls service)
    │
    ▼
Service (business logic, transforms data)
    │
    ▼
Repository (SQL queries via node-postgres)
    │
    ▼
PostgreSQL
    │
    ▼ (response travels back up the chain)
JSON Response to React
```

---

## Backend Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Routes** | Define HTTP endpoints, attach middleware |
| **Middleware** | Auth verification, role checks, error handling, request logging |
| **Controllers** | Parse request, validate input, delegate to service, return response |
| **Services** | Business logic, validation rules, orchestration |
| **Repositories** | SQL queries, data mapping |
| **Models / Types** | TypeScript interfaces & DB entity types |

---

## Frontend Layer Responsibilities

| Layer | Responsibility |
|---|---|
| **Pages** | Route-level components |
| **Components** | Reusable UI elements |
| **Hooks** | Custom React hooks (data fetching, state) |
| **Context** | Global state (AuthContext, etc.) |
| **Services** | API calls (Axios instances) |
| **Types** | Shared TypeScript interfaces |

---

## Planned Database Schema (High-Level ERD)

```
users
  └── id, name, email, password_hash, role, created_at

customers
  └── id, name, contact_person, email, phone, address, created_at

products
  └── id, name, sku, description, unit, unit_price, created_at

inventory
  └── id, product_id → products, quantity, warehouse_location, updated_at

stock_movements
  └── id, product_id → products, movement_type (IN/OUT), quantity,
      reference_doc, performed_by → users, created_at

challans
  └── id, challan_number, customer_id → customers, created_by → users,
      challan_date, status, created_at

challan_items
  └── id, challan_id → challans, product_id → products,
      quantity, unit_price

crm_followups
  └── id, customer_id → customers, assigned_to → users,
      follow_up_date, notes, status, created_at
```

---

## Authentication & Authorization

- **JWT** (JSON Web Tokens) — stateless, stored in `httpOnly` cookie or `Authorization` header
- **Roles:** `admin`, `sales`, `warehouse`, `accounts`
- **Access control** enforced at route middleware level on the backend

---

## Environment Configuration

| Variable | Location | Purpose |
|---|---|---|
| `DATABASE_URL` | `backend/.env` | PostgreSQL connection string |
| `JWT_SECRET` | `backend/.env` | JWT signing secret |
| `PORT` | `backend/.env` | Express server port |
| `NODE_ENV` | `backend/.env` | `development` / `production` |
| `CORS_ORIGIN` | `backend/.env` | Allowed frontend origin |
| `VITE_API_URL` | `frontend/.env` | Backend base URL for API calls |

---

## Technology Versions (Planned)

| Technology | Version |
|---|---|
| Node.js | 18.x+ |
| React | 18.x |
| TypeScript | 5.x |
| Express | 4.x |
| PostgreSQL | 14.x+ |
| Vite | 5.x |
