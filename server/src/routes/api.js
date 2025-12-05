const express = require('express');
const router = express.Router();
const tenantController = require('../controllers/tenant');
const ingestionController = require('../controllers/ingestion');

// Tenant routes
router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.getTenants);

// Ingestion routes
router.post('/ingestion/sync', ingestionController.syncData);

// Analytics routes
const analyticsController = require('../controllers/analytics');
router.get('/analytics/stats', analyticsController.getStats);
router.get('/analytics/orders-by-date', analyticsController.getOrdersByDate);
router.get('/analytics/top-customers', analyticsController.getTopCustomers);

module.exports = router;
