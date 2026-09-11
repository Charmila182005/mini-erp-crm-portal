# Mini ERP + CRM Operations Portal

## Project Overview

A full-stack Mini ERP + CRM Operations Portal designed for wholesale/distribution companies. The system enables internal employees (Admin, Sales, Warehouse, Accounts) to manage customers, products, inventory, stock movements, sales challans, and CRM follow-ups — all within a single, role-based web application.

> **Status:** Phase 1 — Project Initialization (Scaffold Only)

---

## Technology Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool & dev server |
| CSS | Styling (responsive layout) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| TypeScript | Type safety |
| Express.js | REST API framework |
| ts-node / nodemon | Dev server with hot reload |

### Database
| Technology | Purpose |
|---|---|
| PostgreSQL | Primary relational database |

### Authentication
| Technology | Purpose |
|---|---|
| JWT | Stateless token-based auth |
| Role-based access | Admin / Sales / Warehouse / Accounts roles |

---

## Planned Architecture

```
React Frontend  (Vite, TypeScript)
       │
       │  HTTP / REST
       ▼
Express Backend  (Node.js, TypeScript)
       │
       │  Business Logic / Services / Repositories
       ▼
PostgreSQL Database
```

See [`docs/architecture.md`](./docs/architecture.md) for a detailed architecture breakdown.

---

## Planned Modules

| Module | Description |
|---|---|
| Auth | JWT login / logout, role-based access |
| Dashboard | Summary stats per role |
| Customers | Customer master data + CRM |
| Products | Product catalogue |
| Inventory | Current stock levels |
| Stock Movements | Inbound / outbound stock records |
| Sales Challans | Delivery challan generation |
| CRM Follow-ups | Sales team follow-up tracking |
| Reports | Basic operational reports |

---

## Monorepo Structure

```
mini-erp-crm-portal/
├── frontend/          # React + TypeScript (Vite)
├── backend/           # Node.js + TypeScript + Express
├── database/          # SQL migrations & schema scripts
├── postman/           # API collection files
├── docs/              # Architecture & technical docs
├── .gitignore
└── README.md
```

---

## Local Development Prerequisites

| Prerequisite | Minimum Version |
|---|---|
| Node.js | 18.x or higher |
| npm | 9.x or higher |
| PostgreSQL | 14.x or higher |
| Git | 2.x or higher |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repo-url>
cd mini-erp-crm-portal
```

### 2. Setup Backend

```bash
cd backend
cp .env.example .env
# Fill in values in .env
npm install
npm run dev
```

Backend runs at: `http://localhost:3000`  
Health check: `GET http://localhost:3000/api/health`

### 3. Setup Frontend

```bash
cd frontend
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Available Scripts

### Backend (`cd backend`)

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run lint` | Run ESLint |

### Frontend (`cd frontend`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## License

Internal use only — Technical Case Study Project.
