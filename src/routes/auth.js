const express = require('express');
const jwt = require('jsonwebtoken');
const { logger } = require('../middleware/logging');
const router = express.Router();

/**
 * Authentication Routes
 * 
 * Handles user login and JWT token generation.
 * For this demo, uses hard-coded credentials.
 * In production, this would verify against a database.
 */

// Hard-coded user for demo purposes
const DEMO_USER = {
  email: 'test@example.com',
  password: 'password123'
};

/**
 * POST /login
 * 
 * Authenticates user and returns JWT token.
 * 
 * Request body: { email: string, password: string }
 * Response: { token: string } on success
 */
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { email });
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Check credentials (hard-coded for demo)
    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      // Generate JWT token
      // Token expires in 24 hours
      const token = jwt.sign(
        { email: email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      // Log successful login
      logger.info('User logged in successfully', {
        event: 'login_success',
        email: email
      });
      
      // Set token in HTTP-only cookie for browser requests
      // Also return token in JSON for API clients
      res.cookie('token', token, {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      return res.json({ token: token, success: true });
    } else {
      // Log failed login attempt
      logger.warn('Login attempt failed', {
        event: 'login_failed',
        email: email
      });
      
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    logger.error('Login error', { error: error.message, stack: error.stack });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /logout
 * 
 * Logs out the user by clearing the token cookie.
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;

