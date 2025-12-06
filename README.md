# Shopify Data Ingestion & Insights Service

A multi-tenant Shopify Data Ingestion & Insights Service that simulates how Xeno helps enterprise retailers onboard, integrate, and analyze their customer data.

## Table of Contents
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Known Limitations](#known-limitations)

## Architecture

The application follows a standard 3-tier architecture with a specialized ingestion layer for Shopify.

```mermaid
graph TD
    User[User / Admin] -->|Interacts| Client[Next.js Client]
    Client -->|API Requests| Server[Express Server]
    
    subgraph Backend
    Server -->|ORM| DB[(PostgreSQL Database)]
    Server -->|Rest API| Shopify[Shopify Admin API]
    end
    
    subgraph Data Flow
    Shopify -->|Syncs Orders/Customers| Server
    Server -->|Stores Data| DB
    DB -->|Analytics Queries| Server
    end
```

**Tech Stack:**
-   **Frontend**: Next.js (React), TailwindCSS, Recharts.
-   **Backend**: Node.js, Express.
-   **Database**: PostgreSQL, Prisma ORM.
-   **Integration**: Shopify Admin REST API.

## Prerequisites

-   **Node.js**: v18 or higher recommended.
-   **PostgreSQL**: Local or cloud instance (e.g., Supabase, Neon).
-   **Git**: To clone the repository.
-   **Shopify Partner Account**: To create a development store and get API credentials.
    -   *Note*: For testing, you can use the included `server/scripts/generate_orders.js` to populate data without a live store.

## Installation & Setup

### 1. Database Setup
1.  Ensure PostgreSQL is running.
2.  Create a database named `shopify_ingestion` (or similar).

### 2. Backend (Server)
1.  Navigate to `server/`:
    ```bash
    cd server
    npm install
    ```
2.  Configure Environment:
    -   Create `.env`:
        ```env
        DATABASE_URL="postgresql://user:password@localhost:5432/shopify_ingestion?schema=public"
        PORT=3001
        
        # Optional: For Dummy Data Generation
        SHOPIFY_SHOP_URL=your-shop.myshopify.com
        SHOPIFY_ACCESS_TOKEN=shpat_...
        ```
3.  Initialize Database:
    ```bash
    npx prisma migrate dev --name init
    ```
4.  Start Server:
    ```bash
    npm run dev
    ```

### 3. Frontend (Client)
1.  Navigate to `client/`:
    ```bash
    cd client
    npm install
    ```
2.  Start Client:
    ```bash
    npm run dev
    ```
    Access at `http://localhost:3000`.

## API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **Tenants** | | |
| `GET` | `/tenants` | List all registered tenants. |
| `POST` | `/tenants` | Register a new tenant (Shopify store). |
| **Ingestion** | | |
| `POST` | `/ingestion/sync` | Trigger data sync for a tenant (fetch from Shopify). |
| **Analytics** | | |
| `GET` | `/analytics/stats` | Get high-level stats (Total Revenue, Orders, Customers). |
| `GET` | `/analytics/orders-by-date` | Get revenue trend over time. |
| `GET` | `/analytics/top-customers` | Get top 5 customers by spend. |
| `GET` | `/analytics/customers-over-time` | Get cumulative customer growth. |

## Database Schema

The database uses a multi-tenant model where all critical entities belong to a `Tenant`.

-   **Tenant**: Stores Shopify credentials and store info.
-   **Customer**: Synced Shopify customers. Unique by `(shopifyId, tenantId)`.
-   **Product**: Synced Shopify products.
-   **Order**: Synced Shopify orders. Links to `Customer`.

*Key Relations:*
-   `Tenant` 1-n `Customer`
-   `Tenant` 1-n `Order`
-   `Customer` 1-n `Order`

## Known Limitations

1.  **Sync Latency**: Data synchronization is triggered manually via API. Real-time webhooks are not currently implemented.
2.  **Rate Limits**: The Shopify API has rate limits. The ingestion service and dummy generator have basic retry logic but may pause during heavy loads.
3.  **Visualization Data**: Shopify API sometimes ignores backdated `created_at` fields on new orders. 
    -   *Workaround*: Use `server/scripts/fix_order_dates.js` to redistribute order dates in the local database for better visualization.
