const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const WeightLog = require('../models/WeightLog');
const User = require('../models/User');

// Get all weight logs for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const weightLogs = await WeightLog.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(weightLogs);
  } catch (error) {
    console.error('Error fetching weight logs:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new weight log
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const { weight, note } = req.body;
    if (!weight || weight < 0) {
      return res.status(400).json({ message: 'Invalid weight value' });
    }

    const weightLog = new WeightLog({
      userId: req.user.id,
      weight,
      note,
    });

    await weightLog.save();
    res.status(201).json(weightLog);
  } catch (error) {
    console.error('Error creating weight log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a weight log
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const { weight, note } = req.body;
    if (weight !== undefined && weight < 0) {
      return res.status(400).json({ message: 'Invalid weight value' });
    }

    const weightLog = await WeightLog.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!weightLog) {
      return res.status(404).json({ message: 'Weight log not found' });
    }

    if (weight !== undefined) weightLog.weight = weight;
    if (note !== undefined) weightLog.note = note;

    await weightLog.save();
    res.json(weightLog);
  } catch (error) {
    console.error('Error updating weight log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a weight log
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'This feature requires a premium subscription' });
    }

    const weightLog = await WeightLog.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!weightLog) {
      return res.status(404).json({ message: 'Weight log not found' });
    }

    await weightLog.remove();
    res.json({ message: 'Weight log deleted' });
  } catch (error) {
    console.error('Error deleting weight log:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 