const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WaterLog = require('../models/WaterLog');
const User = require('../models/User');

// Get all water logs for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const waterLogs = await WaterLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(waterLogs);
  } catch (error) {
    console.error('Error fetching water logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new water log
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const { amount } = req.body;
    if (!amount || amount < 0) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const waterLog = new WaterLog({
      userId: req.user.id,
      amount,
    });

    await waterLog.save();
    res.status(201).json(waterLog);
  } catch (error) {
    console.error('Error creating water log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a water log
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const waterLog = await WaterLog.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!waterLog) {
      return res.status(404).json({ message: 'Water log not found' });
    }

    await waterLog.remove();
    res.json({ message: 'Water log deleted' });
  } catch (error) {
    console.error('Error deleting water log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 