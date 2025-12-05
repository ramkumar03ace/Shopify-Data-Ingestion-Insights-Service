# Shopify Data Ingestion & Insights Service

## 1. Assumptions
- **Shopify Connection**: We assume the user has a "Custom App" created in their Shopify Admin. We require the `Shop URL` and the `Admin API Access Token` (starting with `shpat_`).
- **Data Volume**: The solution is designed for typical SME stores. For enterprise scale with millions of records, the ingestion logic would need to be moved to a queue-based system (Redis/BullMQ) to handle rate limits and timeouts.
- **Authentication**: For this MVP, "Authentication" is simplified to a tenant selection screen. In production, this would be replaced by a secure login system (e.g., Auth0 or NextAuth) linked to the Tenant model.
- **Database**: We assume a PostgreSQL database is available.

## 2. High-Level Architecture
The system follows a standard Monorepo structure with a clear separation of concerns:

### Backend (`/server`)
- **Framework**: Node.js with Express.
- **Database**: PostgreSQL with Prisma ORM.
- **Services**:
    - `ShopifyService`: Handles communication with Shopify Admin API.
    - `IngestionController`: Orchestrates the data sync process.
    - `AnalyticsController`: Aggregates data for the dashboard.
- **Multi-tenancy**: Implemented at the application level. Each record (`Customer`, `Product`, `Order`) is tagged with a `tenantId`. All queries are scoped by `tenantId`.

### Frontend (`/client`)
- **Framework**: Next.js (App Router).
- **Styling**: Tailwind CSS.
- **Visualization**: Recharts for trend charts.
- **State**: React local state (simplified for MVP).

## 3. APIs and Data Models

### Data Models (Prisma)
- **Tenant**: Represents a store. Contains `shopifyUrl` and `accessToken`.
- **Customer**: Synced from Shopify. Fields: `email`, `totalSpent`, etc.
- **Product**: Synced from Shopify. Fields: `title`, `price`.
- **Order**: Synced from Shopify. Fields: `totalPrice`, `createdAt`.

### Key APIs
- `POST /api/tenants`: Onboard a new store.
- `POST /api/ingestion/sync`: Trigger a data sync for a tenant.
- `GET /api/analytics/stats`: Get high-level metrics (Revenue, Orders).
- `GET /api/analytics/orders-by-date`: Get time-series data for charts.
- `GET /api/analytics/top-customers`: Get top 5 customers by spend.

## 4. Next Steps to Productionize
1.  **Queue System**: Implement Redis + BullMQ to handle background ingestion jobs reliably, respecting Shopify's API rate limits (leaky bucket).
2.  **Webhooks**: Implement Shopify Webhooks (`orders/create`, `products/update`) for real-time updates instead of manual sync.
3.  **Security**: Encrypt the `accessToken` in the database. Implement proper JWT authentication for users.
4.  **Testing**: Add unit tests (Jest) and integration tests.
5.  **Deployment**: Set up CI/CD pipelines for automated deployment to Vercel (Frontend) and Render/Railway (Backend).
