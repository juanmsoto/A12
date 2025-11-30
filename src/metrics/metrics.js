const promClient = require('prom-client');

/**
 * Prometheus Metrics Setup
 * 
 * This module configures Prometheus metrics for observability:
 * - HTTP request count by route and status code
 * - HTTP request duration histogram
 * - Total number of spam reports
 * 
 * Metrics are exposed at /metrics endpoint in Prometheus format.
 */

// Create a Registry to register metrics
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

/**
 * HTTP Request Counter
 * Tracks total number of HTTP requests by route and status code
 */
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

/**
 * HTTP Request Duration Histogram
 * Tracks request duration in seconds for latency analysis
 */
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5], // Buckets for latency distribution
  registers: [register]
});

/**
 * Spam Reports Counter
 * Tracks total number of spam reports submitted
 */
const spamReportsTotal = new promClient.Counter({
  name: 'spam_reports_total',
  help: 'Total number of spam reports submitted',
  labelNames: ['message_id'],
  registers: [register]
});

/**
 * Middleware to record HTTP metrics
 * Should be used after routes are defined to capture route names
 */
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const route = req.route ? req.route.path : req.path;
  
  // Record response when it finishes
  res.on('finish', () => {
    const duration = (Date.now() - startTime) / 1000; // Convert to seconds
    
    // Record metrics
    httpRequestsTotal.inc({
      method: req.method,
      route: route,
      status_code: res.statusCode
    });
    
    httpRequestDuration.observe({
      method: req.method,
      route: route,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
};

/**
 * Record a spam report event
 */
function recordSpamReport(messageId) {
  spamReportsTotal.inc({ message_id: messageId });
}

/**
 * Get metrics in Prometheus format
 */
async function getMetrics() {
  return register.metrics();
}

module.exports = {
  metricsMiddleware,
  recordSpamReport,
  getMetrics,
  register
};

