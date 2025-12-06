# Shopify Data Ingestion & Insights Service

A multi-tenant Shopify Data Ingestion & Insights Service that simulates how Xeno helps enterprise retailers onboard, integrate, and analyze their customer data.

## Prerequisites

- **Node.js**: v18 or higher recommended.
- **PostgreSQL**: Local or cloud instance (e.g., Supabase, Neon).
- **Git**: To clone the repository.
- **Shopify Partner Account**: To create a development store and get API credentials (optional if you just want to run the app without real sync suitable for testing).

## Project Structure

This is a monorepo containing:
- `server/`: Node.js + Express backend with Prisma & PostgreSQL.
- `client/`: Next.js frontend.

## Installation & Setup

### 1. Database Setup

1.  Make sure you have a PostgreSQL database running.
2.  Create a new database (e.g., `shopify_ingestion`).

### 2. Backend (Server) Setup

1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
        *(On Windows PowerShell: `copy .env.example .env`)*
    - Edit `.env` and update the `DATABASE_URL` with your credentials:
      ```env
      DATABASE_URL="postgresql://user:password@localhost:5432/shopify_ingestion?schema=public"
      PORT=3001
      ```
4.  Run Prisma Migrations to set up the database schema:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Start the backend server:
    ```bash
    npm run dev
    ```
    The server should start on `http://localhost:3001`.

### 3. Frontend (Client) Setup

1.  Open a new terminal and navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    The client should be available at `http://localhost:3000`.

## Running the Application

1.  Ensure **both** the server (port 3001) and client (port 3000) are running.
2.  Open your browser and go to `http://localhost:3000`.
3.  Follow the UI instructions to onboard a tenant or view analytics.
