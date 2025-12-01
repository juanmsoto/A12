require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');

// Middleware
const { requestLogger, errorLogger } = require('./middleware/logging');
const { authenticateToken } = require('./middleware/auth');
const { metricsMiddleware, getMetrics } = require('./metrics/metrics');

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const messagesRoutes = require('./routes/messages');
const healthRoutes = require('./routes/health');

// Services
const { reportSpam } = require('./services/spamService');
const featureToggles = require('./middleware/featureToggles');
const { logger } = require('./middleware/logging');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is required!');
  console.error('Please set JWT_SECRET in your .env file.');
  process.exit(1);
}

// View engine setup (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Request logging middleware (should be early in the chain)
app.use(requestLogger);

// Metrics middleware (records HTTP metrics)
app.use(metricsMiddleware);

// Static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Public routes (no authentication required)

// Root route - redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login page (GET) - show login form
app.get('/login', (req, res) => {
  res.render('login');
});

// Login and logout endpoints
app.use('/login', authRoutes);
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

// Health check (public, for monitoring)
app.use('/health', healthRoutes);

// Metrics endpoint (public, for Prometheus scraping)
app.get('/metrics', async (req, res) => {
  try {
    const metrics = await getMetrics();
    res.set('Content-Type', 'text/plain');
    res.send(metrics);
  } catch (error) {
    res.status(500).send('Error generating metrics');
  }
});

// Protected routes (require JWT authentication)
// All routes below this line require valid JWT token
app.use(authenticateToken);

app.use('/dashboard', dashboardRoutes);
app.use('/messages', messagesRoutes);

// Direct route for report-spam (also accessible via /messages/report-spam/:id)
app.post('/report-spam/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    const userEmail = req.user.email;
    
    // Check if feature is enabled (defense in depth)
    if (!featureToggles.isFeatureEnabled('FEATURE_SPAM_REPORT_BUTTON')) {
      return res.status(403).json({ error: 'Spam reporting feature is disabled' });
    }
    
    // Hard-coded messages for demo (same as in messages.js)
    const DEMO_MESSAGES = [
      { id: '1', from: 'sender1@example.com', subject: 'Important Update', body: 'This is an important message.' },
      { id: '2', from: 'sender2@example.com', subject: 'Weekly Newsletter', body: 'Check out our weekly updates.' },
      { id: '3', from: 'spammer@example.com', subject: 'You Won a Prize!', body: 'Click here to claim your prize!' },
      { id: '4', from: 'sender3@example.com', subject: 'Meeting Reminder', body: 'Don\'t forget about the meeting tomorrow.' }
    ];
    
    // Check if message exists
    const message = DEMO_MESSAGES.find(m => m.id === messageId);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    // Report spam
    const result = await reportSpam(messageId, userEmail);
    
    res.json({
      success: true,
      message: 'Spam reported successfully',
      data: result
    });
  } catch (error) {
    logger.error('Error reporting spam', { error: error.message, stack: error.stack });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware (should be last)
app.use(errorLogger);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nDevSecOps Demo App running on http://localhost:${PORT}`);
  console.log(`Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`Health check at http://localhost:${PORT}/health`);
  console.log(`\nDefault credentials:`);
  console.log(`   Email: test@example.com`);
  console.log(`   Password: password123\n`);
});

module.exports = app;

