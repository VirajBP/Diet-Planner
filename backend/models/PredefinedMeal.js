const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  unit: {
    type: String,
    required: true
  },
  calories: {
    type: Number,
    required: true
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
  }
});

const predefinedMealSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  // Search-friendly fields
  searchName: {
    type: String,
    required: true
  },
  searchKeywords: [{
    type: String
  }],
  units: [unitSchema],
  tags: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'halal', 'kosher', 'none']
  }],
  ingredients: [{
    type: String
  }],
  recipe: [{
    type: String
  }],
  category: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'],
    default: 'lunch'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  prepTime: {
    type: Number, // in minutes
    default: 30
  },
  cookTime: {
    type: Number, // in minutes
    default: 20
  },
  servings: {
    type: Number,
    default: 2
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate search-friendly fields
predefinedMealSchema.pre('save', function(next) {
  // Generate lowercase search name
  this.searchName = this.name.toLowerCase();
  
  // Generate search keywords from name, ingredients, and tags
  const keywords = new Set();
  
  // Add name words
  const nameWords = this.name.toLowerCase().split(/\s+/);
  nameWords.forEach(word => {
    if (word.length > 2) { // Only add words longer than 2 characters
      keywords.add(word);
    }
  });
  
  // Add ingredient words
  if (this.ingredients) {
    this.ingredients.forEach(ingredient => {
      const ingredientWords = ingredient.toLowerCase().split(/\s+/);
      ingredientWords.forEach(word => {
        if (word.length > 2) {
          keywords.add(word);
        }
      });
    });
  }
  
  // Add tags
  if (this.tags) {
    this.tags.forEach(tag => {
      keywords.add(tag.toLowerCase());
    });
  }
  
  // Add category
  if (this.category) {
    keywords.add(this.category.toLowerCase());
  }
  
  this.searchKeywords = Array.from(keywords);
  next();
});

// Indexes for faster searches
predefinedMealSchema.index({ searchName: 'text', searchKeywords: 'text', ingredients: 'text' });
predefinedMealSchema.index({ name: 1 });
predefinedMealSchema.index({ searchKeywords: 1 });
predefinedMealSchema.index({ tags: 1 });
predefinedMealSchema.index({ category: 1 });

module.exports = mongoose.model('PredefinedMeal', predefinedMealSchema); 