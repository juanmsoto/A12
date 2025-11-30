const winston = require('winston');
const featureToggles = require('./featureToggles');

/**
 * Winston Logger Configuration
 * 
 * This logger is used throughout the application to record:
 * - HTTP requests (method, path, user, feature toggles)
 * - Errors (with stack traces)
 * - Important events (login, spam reports, etc.)
 * 
 * Log levels: info, warn, error
 */

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'devsecops-demo' },
  transports: [
    // Log to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Express Middleware for Request Logging
 * 
 * Logs each incoming request with:
 * - HTTP method and path
 * - Authenticated user (if available)
 * - Active feature toggles for this request
 * - Response status code
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request details
  const logData = {
    method: req.method,
    path: req.path,
    user: req.user ? req.user.email : 'anonymous',
    featureToggles: featureToggles.getAllToggles()
  };
  
  logger.info('Incoming request', logData);
  
  // Log response when it finishes
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      ...logData,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });
  
  next();
};

/**
 * Error Logging Middleware
 * 
 * Logs errors with full stack traces for debugging
 */
const errorLogger = (err, req, res, next) => {
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    user: req.user ? req.user.email : 'anonymous'
  });
  
  next(err);
};

module.exports = {
  logger,
  requestLogger,
  errorLogger
};

