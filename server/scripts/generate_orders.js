const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const SHOP_URL = process.env.SHOPIFY_SHOP_URL;
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;

if (!SHOP_URL || !ACCESS_TOKEN) {
    console.error('Missing SHOPIFY_SHOP_URL or SHOPIFY_ACCESS_TOKEN in .env');
    process.exit(1);
}

const cleanedShopUrl = SHOP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
const baseUrl = `https://${cleanedShopUrl}/admin/api/2024-01`;

const client = axios.create({
    baseURL: baseUrl,
    headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json',
    },
});

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function getProducts() {
    try {
        const response = await client.get('/products.json?limit=250');
        return response.data.products;
    } catch (error) {
        console.error('Error fetching products:', error.message);
        return [];
    }
}

async function getCustomers() {
    try {
        const response = await client.get('/customers.json?limit=250');
        return response.data.customers;
    } catch (error) {
        console.error('Error fetching customers:', error.message);
        return [];
    }
}

async function createOrder(orderData) {
    let retries = 5;
    while (retries > 0) {
        try {
            const response = await client.post('/orders.json', { order: orderData });
            console.log(`Created order ${response.data.order.name}`);
            return response.data.order;
        } catch (error) {
            if (error.response?.status === 429) {
                console.log('Rate limit hit. Waiting 10 seconds...');
                await new Promise(r => setTimeout(r, 10000));
                retries--;
            } else {
                console.error('Error creating order:', error.response?.data?.errors || error.message);
                return null;
            }
        }
    }
    console.error('Failed to create order after retries');
}

async function main() {
    console.log('Starting dummy order generation...');

    // 1. Fetch Resources
    const products = await getProducts();
    if (products.length === 0) {
        console.error('No products found. Please create some products in Shopify first.');
        return;
    }

    let customers = await getCustomers();
    if (customers.length === 0) {
        console.log('No customers found. Creating a dummy customer...');
        try {
            const newCustomer = await client.post('/customers.json', {
                customer: {
                    first_name: "John",
                    last_name: "Doe",
                    email: `john.doe.${Date.now()}@example.com`,
                    verified_email: true,
                }
            });
            customers = [newCustomer.data.customer];
        } catch (e) {
            console.error('Failed to create dummy customer:', e.message);
            return;
        }
    }

    // 2. Generate Orders
    const ORDER_COUNT = 50;
    console.log(`Generating ${ORDER_COUNT} orders...`);

    for (let i = 0; i < ORDER_COUNT; i++) {
        // Random Customer
        const customer = customers[Math.floor(Math.random() * customers.length)];

        // Random Line Items
        const lineItems = [];
        const numItems = randomInt(1, 4);
        for (let j = 0; j < numItems; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            const variant = product.variants[0]; // Simplification: use first variant
            if (variant) {
                lineItems.push({
                    variant_id: variant.id,
                    quantity: randomInt(1, 3),
                    price: variant.price
                });
            }
        }

        if (lineItems.length === 0) continue;

        // Construct Order
        const date = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());

        const orderData = {
            customer: { id: customer.id },
            line_items: lineItems,
            created_at: date.toISOString(),
            processed_at: date.toISOString(),
            financial_status: 'paid',
            inventory_behaviour: 'bypass' // Don't affect inventory if possible, though 'bypass' handles validation
        };

        await createOrder(orderData);

        // Rate limit kindness
        await new Promise(r => setTimeout(r, 2000));
    }

    console.log('Done!');
}

main();
