const ShopifyService = require('../services/shopify');

exports.syncData = async (req, res) => {
    try {
        const { tenantId } = req.body;
        if (!tenantId) {
            return res.status(400).json({ error: 'Tenant ID is required' });
        }

        // Trigger sync in background (or await if simple)
        // For this assignment, awaiting is fine to show result, but usually background job.
        // I'll await it to give immediate feedback for the demo.
        await ShopifyService.syncTenantData(tenantId);

        res.json({ message: 'Data sync completed successfully' });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: error.message || 'Failed to sync data' });
    }
};
