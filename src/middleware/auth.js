const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * 
 * This middleware validates JWT tokens from the Authorization header.
 * It extracts the token, verifies it using JWT_SECRET, and attaches
 * the decoded user info to req.user for use in route handlers.
 * 
 * Security: Uses JWT_SECRET from environment variables to prevent
 * token forgery. Tokens expire after 24 hours.
 */
const authenticateToken = (req, res, next) => {
  // Extract token from multiple sources:
  // 1. Authorization header: "Bearer <token>" (for API calls)
  // 2. Cookie: "token" (for browser requests)
  // 3. Query parameter: "token" (fallback, less secure)
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1]; // Get token after "Bearer "
  
  // If not in header, try cookie
  if (!token) {
    token = req.cookies?.token;
  }
  
  // If still not found, try query parameter (for demo purposes)
  if (!token) {
    token = req.query?.token;
  }

  if (!token) {
    // For HTML requests, redirect to login
    if (req.accepts('html')) {
      return res.redirect('/login');
    }
    // For API requests, return JSON error
    return res.status(401).json({ error: 'Access token required' });
  }

  // Verify token using JWT_SECRET from environment
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // For HTML requests, redirect to login
      if (req.accepts('html')) {
        return res.redirect('/login');
      }
      // For API requests, return JSON error
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Attach user info to request object for use in routes
    req.user = user;
    next();
  });
};

module.exports = { authenticateToken };

