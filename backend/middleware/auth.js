const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      console.log('[AUTH] Incoming token (masked):', token ? token.slice(0, 8) + '...' : 'none');
    } else {
      console.warn('[AUTH] No token provided in Authorization header');
    }

    if (!token) {
      console.warn('[AUTH] No token, authorization denied');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwtSecret);
      console.log('[AUTH] Token decoded payload:', decoded);
    } catch (err) {
      console.error('[AUTH] Token verification failed:', err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
    
    // Handle both token formats (userId and id)
    req.user = {
      id: decoded.userId || decoded.id
    };
    console.log('[AUTH] Extracted user ID:', req.user.id);

    if (!req.user.id) {
      console.warn('[AUTH] Invalid token format, no user ID');
      return res.status(401).json({ message: 'Invalid token format' });
    }

    next();
  } catch (error) {
    console.error('[AUTH] Middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 