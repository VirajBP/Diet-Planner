const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  target: {
    type: Number,
    default: 2000, // Default target of 2000ml
  },
  note: {
    type: String,
    trim: true,
    maxLength: 500,
  },
}, {
  timestamps: true
});

// Index for faster queries
waterLogSchema.index({ userId: 1, createdAt: -1 });

const WaterLog = mongoose.model('WaterLog', waterLogSchema);

module.exports = WaterLog; 