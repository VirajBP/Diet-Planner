const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
  },
  note: {
    type: String,
    trim: true,
    maxLength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
weightLogSchema.index({ userId: 1, createdAt: -1 });

const WeightLog = mongoose.model('WeightLog', weightLogSchema);

module.exports = WeightLog; 