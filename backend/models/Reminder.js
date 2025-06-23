const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['meal', 'water', 'exercise', 'weight'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  time: {
    type: String, // Format: "HH:MM"
    required: true
  },
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: function() { return this.type === 'meal'; }
  },
  notificationId: {
    type: String, // For storing device notification ID
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
reminderSchema.index({ userId: 1, type: 1 });
reminderSchema.index({ time: 1, isActive: 1 });

module.exports = mongoose.model('Reminder', reminderSchema); 