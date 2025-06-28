const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');


    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Handle both token formats (userId and id)
    req.user = {
      id: decoded.userId || decoded.id
    };

    if (!req.user.id) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 