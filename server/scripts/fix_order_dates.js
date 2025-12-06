const prisma = require('../src/lib/prisma');

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
    console.log('Starting date redistribution...');

    try {
        const orders = await prisma.order.findMany({
            orderBy: { id: 'desc' }
        });
        console.log(`Found ${orders.length} orders.`);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const today = new Date();

        let updatedCount = 0;

        // Keep top 4 orders as "today", shuffle the rest
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            let newDate;

            if (i < 4) {
                // Keep the 4 newest orders as today
                newDate = today;
            } else {
                // Determine random date in the past (30 days ago to yesterday)
                newDate = randomDate(thirtyDaysAgo, yesterday);
            }

            await prisma.order.update({
                where: { id: order.id },
                data: {
                    createdAt: newDate,
                    processedAt: newDate
                }
            });
            updatedCount++;
            if (updatedCount % 10 === 0) process.stdout.write('.');
        }

        console.log(`\nSuccessfully updated dates for ${updatedCount} orders.`);
    } catch (error) {
        console.error('Error updating dates:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
