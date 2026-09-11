# Mini ERP + CRM Operations Portal

A full-stack Mini ERP + CRM Operations Portal for wholesale and distribution businesses.

The application provides role-based management of customers, CRM follow-ups, products, inventory, stock movements, and sales challans through a single web portal.

## Project Status

**Status: Completed – Technical Case Study Implementation**

The core ERP + CRM workflow has been implemented and tested locally.

---

## Key Features

### Authentication & Role-Based Access

The system supports four employee roles:

- Admin
- Sales
- Warehouse
- Accounts

Authentication is implemented using JWT.

Role-based authorization controls access to protected operations.

### CRM / Customer Management

- Add customers
- Edit customers
- Search customers
- View customer details
- Customer types:
  - Retail
  - Wholesale
  - Distributor
- Customer status:
  - Lead
  - Active
  - Inactive
- Follow-up date
- CRM notes
- Add, edit and delete customer follow-ups

### Product & Inventory Management

- Add products
- Edit products
- Delete products
- Product SKU
- Product category
- Unit price
- Current stock
- Minimum stock quantity
- Warehouse/location information
- Low-stock indication

### Stock Movements

The system maintains stock movement history for:

- Stock IN
- Stock OUT
- Quantity changed
- Reason
- User who performed the movement
- Timestamp

Stock cannot become negative.

If an OUT movement exceeds the available stock, the API returns an insufficient-stock error.

### Sales Challans

- Create sales challan
- Automatic challan number
- Select customer
- Add multiple products
- Specify quantities
- Draft status
- Confirmed status
- View challan details

Business rules:

- Creating a draft does not reduce stock.
- Confirming a challan reduces stock.
- Insufficient stock prevents confirmation.
- Stock changes are performed transactionally.
- Challan items store product snapshot information such as product name, SKU and unit price.

---

## Technology Stack

### Frontend

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| CSS | Responsive UI |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| TypeScript | Type safety |
| Express.js | REST API framework |
| JWT | Authentication |
| CORS | Cross-origin API access |
| Helmet | Security headers |
| Morgan | HTTP request logging |

### Database

| Technology | Purpose |
|---|---|
| PostgreSQL | Relational database |
| Neon | Cloud PostgreSQL database |

---

## Architecture

```text
                 React + TypeScript
                       │
                       │ REST API / JSON
                       ▼
              Node.js + Express
                       │
              ┌────────┴────────┐
              │                 │
        JWT Authentication   Role Authorization
              │                 │
              └────────┬────────┘
                       ▼
                Business Services
                       │
                       ▼
                 PostgreSQL
                    (Neon)