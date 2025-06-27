const mongoose = require('mongoose');

const mealEntrySchema = new mongoose.Schema({
  meal: { type: mongoose.Schema.Types.ObjectId, ref: 'PredefinedMeal', required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  category: { type: String, enum: ['breakfast', 'lunch', 'snack', 'dinner'], required: true }
}, { _id: false });

const mealPackageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  goal: { type: String, enum: ['lose', 'maintain', 'gain'], required: true },
  tags: [{ type: String }],
  totalCalories: { type: Number, required: true },
  meals: [mealEntrySchema]
}, { timestamps: true });

module.exports = mongoose.model('MealPackage', mealPackageSchema); 