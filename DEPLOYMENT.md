# Deployment Guide

This guide explains how to deploy the **Shopify Data Ingestion & Insights Service** to production using Vercel (Frontend) and Render (Backend & Database).

## Prerequisites
-   A GitHub account with this repository pushed.
-   Accounts on [Vercel](https://vercel.com) and [Render](https://render.com).

---

## 1. Database Deployment (Render)

1.  Log in to **Render** and click **New +**.
2.  Select **PostgreSQL**.
3.  Fill in the details:
    -   **Name**: `shopify-ingestion-db`
    -   **Region**: Choose one close to you.
    -   **Instance Type**: Free (for hobby/dev) or Starter.
4.  Click **Create Database**.
5.  Wait for it to be created.
6.  **Copy the "Internal Database URL"** (if deploying backend to Render) or **"External Database URL"** (if running locally or elsewhere). You will need this for the backend environment variables.

---

## 2. Backend Deployment (Render)

1.  On Render, click **New +** and select **Web Service**.
2.  Connect your GitHub repository.
3.  Configure the service:
    -   **Name**: `shopify-ingestion-backend`
    -   **Root Directory**: `server`
    -   **Runtime**: Node
    -   **Build Command**: `npm install && npx prisma generate`
    -   **Start Command**: `npm start`
4.  **Environment Variables**:
    Scroll down to "Environment Variables" and add:
    -   `DATABASE_URL`: The Internal Database URL you copied from step 1.
    -   `PORT`: `10000` (Render's default port).
      - *Note*: You also need to add `SHOPIFY_SHOP_URL` and `SHOPIFY_ACCESS_TOKEN` if you plan to use the sync/dummy scripts in production.
5.  Click **Create Web Service**.
6.  Once deployed, Render will provide a URL (e.g., `https://shopify-ingestion-backend.onrender.com`). **Copy this URL**.

### Run Migrations
Since we are using Prisma, we need to ensure the production DB schema is synced.
1.  Go to the **Shell** tab of your deployed Backend service on Render.
2.  Run:
    ```bash
    npx prisma migrate deploy
    ```

---

## 3. Frontend Deployment (Vercel)

1.  Log in to **Vercel** and click **Add New...** -> **Project**.
2.  Import your GitHub repository.
3.  Configure the project:
    -   **Framework Preset**: Next.js (should be auto-detected).
    -   **Root Directory**: Click "Edit" and select `client`.
4.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: The Backend URL you copied from step 2 (e.g., `https://shopify-ingestion-backend.onrender.com`).
        -   *Important*: Ensure there is **no trailing slash** at the end of the URL.
5.  Click **Deploy**.

---

## Verification

1.  Open your Vercel deployment URL.
2.  The dashboard should load.
3.  If data is missing, ensure you have:
    -   Run database migrations.
    -   Configured the correct `DATABASE_URL` in the backend.
    -   Triggered a sync (or run the dummy order script locally pointing to the prod DB).
