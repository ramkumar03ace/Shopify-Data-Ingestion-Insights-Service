const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createTenant = async (req, res) => {
    try {
        const { name, shopifyUrl, accessToken, email } = req.body;

        // Basic validation
        if (!name || !shopifyUrl || !accessToken || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const tenant = await prisma.tenant.create({
            data: {
                name,
                shopifyUrl: shopifyUrl.replace(/^https?:\/\//, '').replace(/\/$/, ''),
                accessToken,
                email,
            },
        });

        res.status(201).json(tenant);
    } catch (error) {
        console.error('Error creating tenant:', error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Shopify URL already exists' });
        }
        res.status(500).json({ error: 'Failed to create tenant' });
    }
};

exports.getTenants = async (req, res) => {
    try {
        const tenants = await prisma.tenant.findMany();
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenants' });
    }
};
