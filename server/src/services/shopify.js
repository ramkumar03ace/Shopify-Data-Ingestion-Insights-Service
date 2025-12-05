const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ShopifyService {
    constructor(shopUrl, accessToken) {
        this.shopUrl = shopUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
        this.accessToken = accessToken;
        this.baseUrl = `https://${this.shopUrl}/admin/api/2024-01`;
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'X-Shopify-Access-Token': this.accessToken,
                'Content-Type': 'application/json',
            },
        });
    }

    async getProducts() {
        try {
            const response = await this.client.get('/products.json?limit=250');
            return response.data.products;
        } catch (error) {
            console.error('Error fetching products:', error.message);
            throw error;
        }
    }

    async getCustomers() {
        try {
            const response = await this.client.get('/customers.json?limit=250');
            return response.data.customers;
        } catch (error) {
            console.error('Error fetching customers:', error.message);
            throw error;
        }
    }

    async getOrders() {
        try {
            const response = await this.client.get('/orders.json?status=any&limit=250');
            return response.data.orders;
        } catch (error) {
            console.error('Error fetching orders:', error.message);
            throw error;
        }
    }

    static async syncTenantData(tenantId) {
        const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new Error('Tenant not found');

        const service = new ShopifyService(tenant.shopifyUrl, tenant.accessToken);

        // 1. Sync Customers
        console.log(`Syncing customers for ${tenant.name}...`);
        const customers = await service.getCustomers();
        for (const customer of customers) {
            await prisma.customer.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(customer.id), tenantId } },
                update: {
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    totalSpent: customer.total_spent,
                    updatedAt: new Date(),
                },
                create: {
                    shopifyId: String(customer.id),
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    totalSpent: customer.total_spent,
                    tenantId,
                },
            });
        }

        // 2. Sync Products
        console.log(`Syncing products for ${tenant.name}...`);
        const products = await service.getProducts();
        for (const product of products) {
            await prisma.product.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(product.id), tenantId } },
                update: {
                    title: product.title,
                    price: product.variants[0]?.price || 0,
                    updatedAt: new Date(),
                },
                create: {
                    shopifyId: String(product.id),
                    title: product.title,
                    price: product.variants[0]?.price || 0,
                    tenantId,
                },
            });
        }

        // 3. Sync Orders
        console.log(`Syncing orders for ${tenant.name}...`);
        const orders = await service.getOrders();
        for (const order of orders) {
            let customerId = null;
            if (order.customer) {
                const dbCustomer = await prisma.customer.findUnique({
                    where: { shopifyId_tenantId: { shopifyId: String(order.customer.id), tenantId } },
                });
                if (dbCustomer) customerId = dbCustomer.id;
            }

            await prisma.order.upsert({
                where: { shopifyId_tenantId: { shopifyId: String(order.id), tenantId } },
                update: {
                    totalPrice: order.total_price,
                    currency: order.currency,
                    processedAt: order.processed_at ? new Date(order.processed_at) : null,
                    customerId,
                    updatedAt: new Date(),
                },
                create: {
                    shopifyId: String(order.id),
                    totalPrice: order.total_price,
                    currency: order.currency,
                    processedAt: order.processed_at ? new Date(order.processed_at) : null,
                    createdAt: new Date(order.created_at),
                    customerId,
                    tenantId,
                },
            });
        }

        console.log(`Sync complete for ${tenant.name}`);
        return { success: true };
    }
}

module.exports = ShopifyService;
