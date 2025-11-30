const express = require('express');
const router = express.Router();

/**
 * Health Check Routes
 * 
 * Provides health check endpoint for monitoring and reliability.
 * Used to determine service availability for SLI/SLO calculations.
 */

/**
 * GET /health
 * 
 * Returns health status of the service.
 * 
 * Response includes:
 * - status: "ok" if service is healthy
 * - uptime: Service uptime in seconds
 * - timestamp: Current server time
 * 
 * This endpoint is used by monitoring systems to check service availability.
 */
router.get('/', (req, res) => {
  // In a real application, you might check:
  // - Database connectivity
  // - External service dependencies
  // - Disk space
  // - Memory usage
  // etc.
  
  // For this demo, we just return a simple health check
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'devsecops-demo'
  });
});

module.exports = router;

