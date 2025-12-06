const prisma = require('../src/lib/prisma');

async function main() {
    try {
        const orders = await prisma.order.findMany({
            select: { createdAt: true }
        });

        const counts = {};
        orders.forEach(o => {
            const date = o.createdAt.toISOString().split('T')[0];
            counts[date] = (counts[date] || 0) + 1;
        });

        console.log('Order counts by date (UTC):');
        Object.keys(counts).sort().forEach(date => {
            console.log(`${date}: ${counts[date]}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
