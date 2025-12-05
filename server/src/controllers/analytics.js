const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

        // Group orders by date (simplified for this assignment)
        // Prisma doesn't support date truncation directly in groupBy easily without raw query or processing in JS.
        // For simplicity and DB compatibility, I'll fetch orders and process in JS (assuming not huge data for demo).

        const orders = await prisma.order.findMany({
            where: { tenantId },
            select: { createdAt: true, totalPrice: true },
            orderBy: { createdAt: 'asc' },
        });

        const salesByDate = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            if (!salesByDate[date]) {
                salesByDate[date] = { date, sales: 0, orders: 0 };
            }
            salesByDate[date].sales += Number(order.totalPrice);
            salesByDate[date].orders += 1;
        });

        res.json(Object.values(salesByDate));
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
