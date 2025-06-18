const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WaterLog = require('../models/WaterLog');
const User = require('../models/User');

// Middleware to check premium status and handle glass size restrictions
const checkPremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    // For GET requests, allow both premium and non-premium users
    if (req.method === 'GET') {
      req.isPremium = user.isPremium;
      return next();
    }
    
    // For POST requests, check glass size restrictions
    if (req.method === 'POST') {
      const { amount } = req.body;
      
      // Non-premium users can only add 250ml logs
      if (!user.isPremium && amount !== 250) {
        return res.status(403).json({ 
          message: 'Non-premium users can only add 250ml water logs. Upgrade to premium for custom amounts.',
          isPremium: false,
          defaultGlassSize: 250
        });
      }
      
      req.isPremium = user.isPremium;
      return next();
    }
    
    // For all other requests, require premium
    if (!user.isPremium) {
      return res.status(403).json({ 
        message: 'This feature requires a premium subscription',
        isPremium: false
      });
    }
    
    req.isPremium = true;
    next();
  } catch (error) {
    console.error('Premium check error:', error);
    res.status(500).json({ message: 'Server error checking premium status' });
  }
};

// Get water logs
router.get('/', auth, checkPremium, async (req, res) => {
  try {
    const logs = await WaterLog.find({ userId: req.user.id })
      .sort({ timestamp: -1 });
    
    // For premium users, return all data
    if (req.isPremium) {
      return res.json({
        logs,
        isPremium: true,
        canCustomizeGlassSize: true,
        defaultGlassSize: 250
      });
    }
    
    // For non-premium users, return basic data
    return res.json({
      logs,
      isPremium: false,
      canCustomizeGlassSize: false,
      defaultGlassSize: 250
    });
  } catch (error) {
    console.error('Error fetching water logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add water log
router.post('/', auth, checkPremium, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const log = new WaterLog({
      userId: req.user.id,
      amount,
      timestamp: new Date()
    });

    await log.save();
    
    res.json({
      log,
      isPremium: req.isPremium,
      canCustomizeGlassSize: req.isPremium,
      defaultGlassSize: 250
    });
  } catch (error) {
    console.error('Error adding water log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete water log (premium only)
router.delete('/:id', auth, checkPremium, async (req, res) => {
  try {
    const log = await WaterLog.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!log) {
      return res.status(404).json({ message: 'Water log not found' });
    }

    res.json({ message: 'Water log deleted successfully' });
  } catch (error) {
    console.error('Error deleting water log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 