const prisma = require('../lib/prisma');

exports.getStats = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const [customerCount, orderCount, totalRevenue] = await Promise.all([
            prisma.customer.count({ where: { tenantId } }),
            prisma.order.count({ where: { tenantId } }),
            prisma.order.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
            }),
        ]);

        res.json({
            totalCustomers: customerCount,
            totalOrders: orderCount,
            totalRevenue: totalRevenue._sum.totalPrice || 0,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

exports.getOrdersByDate = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const orders = await prisma.order.findMany({
            where: { tenantId },
            select: { createdAt: true, totalPrice: true },
            orderBy: { createdAt: 'asc' },
        });

        const salesByDate = {};

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            salesByDate[dateStr] = { date: dateStr, sales: 0, orders: 0 };
        }

        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { date, sales: 0, orders: 0 };
            }
            salesByDate[date].sales += Number(order.totalPrice);
            salesByDate[date].orders += 1;
        });

        const result = Object.values(salesByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.json(result);
    } catch (error) {
        console.error('Error fetching orders by date:', error);
        res.status(500).json({ error: 'Failed to fetch orders by date' });
    }
};

exports.getTopCustomers = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const topCustomers = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { totalSpent: 'desc' },
            take: 5,
        });

        res.json(topCustomers);
    } catch (error) {
        console.error('Error fetching top customers:', error);
        res.status(500).json({ error: 'Failed to fetch top customers' });
    }
};

exports.getCustomersOverTime = async (req, res) => {
    try {
        const { tenantId } = req.query;
        if (!tenantId) return res.status(400).json({ error: 'Tenant ID is required' });

        const customers = await prisma.customer.findMany({
            where: { tenantId },
            select: { createdAt: true },
            orderBy: { createdAt: 'asc' },
        });

        const customersByDate = {};

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            customersByDate[dateStr] = 0;
        }

        customers.forEach(customer => {
            const date = customer.createdAt.toISOString().split('T')[0];
            if (customersByDate[date] === undefined) {
                customersByDate[date] = 0;
            }
            customersByDate[date]++;
        });

        let cumulative = 0;
        const result = Object.keys(customersByDate).sort().map(date => {
            cumulative += customersByDate[date];
            return {
                date,
                newCustomers: customersByDate[date],
                totalCustomers: cumulative
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching customers over time:', error);
        res.status(500).json({ error: 'Failed to fetch customer growth data' });
    }
};
