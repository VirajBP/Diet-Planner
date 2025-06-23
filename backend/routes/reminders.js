const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Reminder = require('../models/Reminder');

// Get all reminders for a user
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.user.id }).sort({ time: 1 });
    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new reminder
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, message, time, days, mealType } = req.body;

    if (!type || !title || !message || !time) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const reminderData = {
      userId: req.user.id,
      type,
      title,
      message,
      time,
      days: days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    };

    if (type === 'meal' && mealType) {
      reminderData.mealType = mealType;
    }

    const reminder = new Reminder(reminderData);
    await reminder.save();

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const { type, title, message, time, days, isActive, mealType } = req.body;

    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const updateData = {};
    if (type) updateData.type = type;
    if (title) updateData.title = title;
    if (message) updateData.message = message;
    if (time) updateData.time = time;
    if (days) updateData.days = days;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (type === 'meal' && mealType) updateData.mealType = mealType;

    const updatedReminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json(updatedReminder);
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle reminder active status
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    reminder.isActive = !reminder.isActive;
    await reminder.save();

    res.json(reminder);
  } catch (error) {
    console.error('Toggle reminder error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 