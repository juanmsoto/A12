const { logger } = require('../middleware/logging');
const { recordSpamReport } = require('../metrics/metrics');

/**
 * Spam Report Service
 * 
 * Handles spam report functionality. In a real application, this would
 * interact with a database or external service. For this demo, it just
 * logs the event and records metrics.
 */

/**
 * Report a message as spam
 * @param {string} messageId - ID of the message to report
 * @param {string} userEmail - Email of the user reporting
 * @returns {Promise<Object>} - Result of the spam report
 */
async function reportSpam(messageId, userEmail) {
  // Log the spam report event
  logger.info('Spam report submitted', {
    event: 'spam_reported',
    messageId: messageId,
    userEmail: userEmail,
    timestamp: new Date().toISOString()
  });
  
  // Record metric for observability
  recordSpamReport(messageId);
  
  // In a real app, this would:
  // - Save to database
  // - Notify moderation team
  // - Update message status
  // - etc.
  
  return {
    success: true,
    messageId: messageId,
    reportedAt: new Date().toISOString()
  };
}

module.exports = {
  reportSpam
};

