const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    default: 'other'
  },
  name: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
  },
  ingredients: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  },
  protein: {
    type: Number,
    default: 0
  },
  carbs: {
    type: Number,
    default: 0
  },
  fat: {
    type: Number,
    default: 0
  },
  predefinedMealId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PredefinedMeal'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meal', mealSchema); 