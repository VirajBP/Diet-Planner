const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MealPackage = require('../models/MealPackage');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /meal-packages/suggest
router.get('/suggest', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Handle case where user doesn't have a profile
    const { goal, tags = [] } = req.query;
    const userGoal = goal || (user.profile?.goal || 'maintain');
    const userTags = tags.length ? tags : (user.profile?.tags || []);
    
    // Default calories if no profile
    let userCalories = 2000; // Default
    let overweight = false;
    
    if (user.profile) {
      try {
        userCalories = user.calculateDailyCalories();
        overweight = user.profile.weight - user.profile.targetWeight > 5;
      } catch (error) {
        console.log('Error calculating calories, using default:', error.message);
      }
    }

    // Build query
    let query = { goal: userGoal };
    if (userTags.length > 0) {
      query.tags = { $all: userTags };
    }
    
    let packages = await MealPackage.find(query).populate({
      path: 'meals.meal',
      model: 'PredefinedMeal'
    });
    
    // Exclude spicy/oily/fat if overweight
    if (overweight) {
      packages = packages.filter(pkg =>
        !pkg.meals.some(entry =>
          entry.meal && entry.meal.tags && entry.meal.tags.some(tag => ['spicy', 'oily', 'fat'].includes(tag))
        )
      );
    }
    
    // Sort by calories closest to userCalories
    packages = packages.sort((a, b) => Math.abs(a.totalCalories - userCalories) - Math.abs(b.totalCalories - userCalories));

    // Scale packages
    const scaledPackages = packages.slice(0, 3).map(pkg => {
      const scalingFactor = userCalories / pkg.totalCalories;
      let scaledTotalCalories = 0;
      const meals = pkg.meals.map(entry => {
        // Handle case where meal might not be populated
        if (!entry.meal) {
          return {
            meal: {
              _id: entry.meal || new mongoose.Types.ObjectId(),
              name: 'Meal not found',
              units: [],
              tags: [],
              ingredients: [],
              category: 'unknown',
              imageUrl: null,
            },
            unit: entry.unit,
            category: entry.category,
            originalQuantity: entry.quantity,
            originalCalories: 0,
            scaledQuantity: entry.quantity * scalingFactor,
            scaledCalories: 0
          };
        }
        
        // Find the unit calories from the referenced PredefinedMeal
        const unitObj = entry.meal.units.find(u => u.unit === entry.unit);
        const unitCalories = unitObj ? unitObj.calories : 0;
        const originalCalories = unitCalories * entry.quantity;
        const scaledQuantity = entry.quantity * scalingFactor;
        const scaledCalories = unitCalories * scaledQuantity;
        scaledTotalCalories += scaledCalories;
        return {
          meal: {
            _id: entry.meal._id,
            name: entry.meal.name,
            units: entry.meal.units,
            tags: entry.meal.tags,
            ingredients: entry.meal.ingredients,
            category: entry.meal.category,
            imageUrl: entry.meal.imageUrl,
          },
          unit: entry.unit,
          category: entry.category,
          originalQuantity: entry.quantity,
          originalCalories,
          scaledQuantity,
          scaledCalories
        };
      });
      return {
        _id: pkg._id,
        title: pkg.title,
        goal: pkg.goal,
        tags: pkg.tags,
        originalTotalCalories: pkg.totalCalories,
        scaledTotalCalories: Math.round(scaledTotalCalories),
        scalingFactor,
        meals
      };
    });
    res.json(scaledPackages);
  } catch (error) {
    console.error('Suggest meal packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /mealPackages/recommend
router.get('/recommend', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(400).json({ message: 'User not found' });
    
    // Use profile or defaults
    const userGoal = user.profile?.goal || 'maintain';
    const userTags = user.profile?.tags || [];
    let userCalories = 2000;
    let overweight = false;
    if (user.profile) {
      try {
        userCalories = user.calculateDailyCalories();
        overweight = user.profile.weight - user.profile.targetWeight > 5;
      } catch (e) { console.log('Calorie calculation error:', e); }
    }
    let query = { goal: userGoal };
    if (userTags.length > 0) query.tags = { $all: userTags };
    console.log('MealPackages /recommend query:', query, 'user:', user.email, 'calories:', userCalories);
    let packages = await MealPackage.find(query).populate({
      path: 'meals.meal',
      model: 'PredefinedMeal'
    });
    console.log('MealPackages /recommend found', packages.length, 'packages');
    if (packages.length === 0 && userTags.length > 0) {
      // Relax tag filter if nothing found
      console.log('No packages found with tags, retrying without tags');
      query = { goal: userGoal };
      packages = await MealPackage.find(query).populate({
        path: 'meals.meal',
        model: 'PredefinedMeal'
      });
      console.log('MealPackages /recommend found', packages.length, 'packages (no tags)');
    }
    if (overweight) {
      packages = packages.filter(pkg =>
        !pkg.meals.some(entry =>
          entry.meal && entry.meal.tags && entry.meal.tags.some(tag => ['spicy', 'oily', 'fat'].includes(tag))
        )
      );
    }
    packages = packages.sort((a, b) => Math.abs(a.totalCalories - userCalories) - Math.abs(b.totalCalories - userCalories));
    const scaledPackages = packages.slice(0, 3).map(pkg => {
      const scalingFactor = userCalories / pkg.totalCalories;
      let scaledTotalCalories = 0;
      const meals = pkg.meals.map(entry => {
        if (!entry.meal) return entry;
        const unitObj = entry.meal.units.find(u => u.unit === entry.unit);
        const unitCalories = unitObj ? unitObj.calories : 0;
        const originalCalories = unitCalories * entry.quantity;
        const scaledQuantity = entry.quantity * scalingFactor;
        const scaledCalories = unitCalories * scaledQuantity;
        scaledTotalCalories += scaledCalories;
        return {
          meal: entry.meal,
          unit: entry.unit,
          category: entry.category,
          originalQuantity: entry.quantity,
          originalCalories,
          scaledQuantity,
          scaledCalories
        };
      });
      return {
        _id: pkg._id,
        title: pkg.title,
        goal: pkg.goal,
        tags: pkg.tags,
        originalTotalCalories: pkg.totalCalories,
        scaledTotalCalories: Math.round(scaledTotalCalories),
        scalingFactor,
        meals
      };
    });
    res.json(scaledPackages);
  } catch (error) {
    console.error('Recommend meal packages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 