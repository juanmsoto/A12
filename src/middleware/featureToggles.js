const fs = require('fs');
const path = require('path');

/**
 * Feature Toggle Configuration
 * 
 * Feature toggles can be configured via:
 * 1. Environment variables (highest priority) - e.g., FEATURE_WELCOME_BANNER=true
 * 2. config/toggles.json file (default values)
 * 
 * This module loads toggles on startup and provides a function to check
 * if a feature is enabled. Environment variables override JSON config.
 */

let featureToggles = {};

/**
 * Load feature toggles from JSON config file
 */
function loadTogglesFromFile() {
  try {
    const configPath = path.join(__dirname, '../../config/toggles.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config;
  } catch (error) {
    console.warn('Could not load toggles.json, using defaults');
    return {};
  }
}

/**
 * Initialize feature toggles
 * Environment variables override JSON config values
 */
function initializeToggles() {
  // Load defaults from JSON file
  const fileToggles = loadTogglesFromFile();
  
  // Start with file values
  featureToggles = { ...fileToggles };
  
  // Override with environment variables if they exist
  // Environment variables are strings, so we convert 'true'/'false' to boolean
  Object.keys(process.env).forEach(key => {
    if (key.startsWith('FEATURE_')) {
      const value = process.env[key];
      featureToggles[key] = value === 'true' || value === '1';
    }
  });
  
  console.log('Feature toggles initialized:', featureToggles);
}

/**
 * Check if a feature toggle is enabled
 * @param {string} toggleName - Name of the feature toggle (e.g., 'FEATURE_WELCOME_BANNER')
 * @returns {boolean} - True if feature is enabled, false otherwise
 */
function isFeatureEnabled(toggleName) {
  return featureToggles[toggleName] === true;
}

/**
 * Get all feature toggles (for debugging/logging)
 */
function getAllToggles() {
  return { ...featureToggles };
}

// Initialize on module load
initializeToggles();

module.exports = {
  isFeatureEnabled,
  getAllToggles,
  initializeToggles // Exported for testing/reload scenarios
};

