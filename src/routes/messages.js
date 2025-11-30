const express = require('express');
const featureToggles = require('../middleware/featureToggles');
const { reportSpam } = require('../services/spamService');
const { logger } = require('../middleware/logging');
const router = express.Router();

/**
 * Messages Routes
 * 
 * Handles message listing and spam reporting.
 * Demonstrates feature toggle usage for FEATURE_SPAM_REPORT_BUTTON.
 */

// Hard-coded messages for demo
const DEMO_MESSAGES = [
  { id: '1', from: 'sender1@example.com', subject: 'Important Update', body: 'This is an important message.' },
  { id: '2', from: 'sender2@example.com', subject: 'Weekly Newsletter', body: 'Check out our weekly updates.' },
  { id: '3', from: 'spammer@example.com', subject: 'You Won a Prize!', body: 'Click here to claim your prize!' },
  { id: '4', from: 'sender3@example.com', subject: 'Meeting Reminder', body: 'Don\'t forget about the meeting tomorrow.' }
];

/**
 * GET /messages
 * 
 * Lists all messages.
 * Feature toggle FEATURE_SPAM_REPORT_BUTTON controls whether spam report buttons are shown.
 * 
 * Authentication: Required (JWT token)
 */
router.get('/', (req, res) => {
  // Check if spam report button feature is enabled
  const showSpamReportButton = featureToggles.isFeatureEnabled('FEATURE_SPAM_REPORT_BUTTON');
  
  res.render('messages', {
    user: req.user,
    messages: DEMO_MESSAGES,
    showSpamReportButton: showSpamReportButton
  });
});

/**
 * POST /report-spam/:id
 * 
 * Reports a message as spam.
 * Only available when FEATURE_SPAM_REPORT_BUTTON is enabled.
 * 
 * Authentication: Required (JWT token)
 * 
 * This route is accessible via:
 * - /messages/report-spam/:id (when router mounted at /messages)
 * - /report-spam/:id (when router mounted at /report-spam)
 */
router.post('/report-spam/:id', async (req, res) => {
  try {
    const messageId = req.params.id;
    const userEmail = req.user.email;
    
    // Check if feature is enabled (defense in depth)
    if (!featureToggles.isFeatureEnabled('FEATURE_SPAM_REPORT_BUTTON')) {
      return res.status(403).json({ error: 'Spam reporting feature is disabled' });
    }
    
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

module.exports = router;

