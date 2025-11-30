const express = require('express');
const featureToggles = require('../middleware/featureToggles');
const router = express.Router();

/**
 * Dashboard Routes
 * 
 * Protected route that shows user dashboard.
 * Demonstrates feature toggle usage for FEATURE_WELCOME_BANNER.
 */

/**
 * GET /dashboard
 * 
 * Shows the user dashboard.
 * Feature toggle FEATURE_WELCOME_BANNER controls whether a welcome banner is displayed.
 * 
 * Authentication: Required (JWT token)
 */
router.get('/', (req, res) => {
  // Check if welcome banner feature is enabled
  const showWelcomeBanner = featureToggles.isFeatureEnabled('FEATURE_WELCOME_BANNER');
  
  res.render('dashboard', {
    user: req.user,
    showWelcomeBanner: showWelcomeBanner
  });
});

module.exports = router;

