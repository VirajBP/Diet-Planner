const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const User = require('../models/User');
const PredefinedMeal = require('../models/PredefinedMeal');

// Get meals for the last 7 days
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching meals for user:', req.user.id);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: sevenDaysAgo }
    }).sort({ date: -1 });

    console.log(`Found ${meals.length} meals for user`);

    if (!meals || meals.length === 0) {
      return res.json([]);
    }

    // Group meals by date
    const mealsByDate = meals.reduce((acc, meal) => {
      const dateStr = meal.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          meals: [],
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0
        };
      }
      acc[dateStr].meals.push({
        id: meal._id,
        type: meal.type,
        name: meal.name,
        calories: meal.calories,
        ingredients: meal.ingredients,
        protein: meal.protein || 0,
        carbs: meal.carbs || 0,
        fat: meal.fat || 0
      });
      acc[dateStr].totalCalories += meal.calories;
      acc[dateStr].totalProtein += meal.protein || 0;
      acc[dateStr].totalCarbs += meal.carbs || 0;
      acc[dateStr].totalFat += meal.fat || 0;
      return acc;
    }, {});

    const response = Object.values(mealsByDate);
    console.log('Successfully processed meals data');
    res.json(response);
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch meals',
      error: error.message 
    });
  }
});

// Add a new meal
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating new meal:', req.body);
    const { type, name, calories, ingredients, protein, carbs, fat } = req.body;
    
    // Validate required fields
    if (!type || !name || calories === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate and parse calories
    const parsedCalories = parseInt(calories);
    if (isNaN(parsedCalories) || parsedCalories < 0) {
      return res.status(400).json({ message: 'Invalid calories value' });
    }

    const meal = new Meal({
      userId: req.user.id,
      type: type.toLowerCase(),
      name,
      calories: parsedCalories,
      ingredients: Array.isArray(ingredients) ? ingredients : 
        (typeof ingredients === 'string' ? ingredients.split(',').map(i => i.trim()).filter(i => i) : []),
      protein: protein ? parseInt(protein) || 0 : 0,
      carbs: carbs ? parseInt(carbs) || 0 : 0,
      fat: fat ? parseInt(fat) || 0 : 0,
      date: new Date()
    });

    console.log('Saving meal:', meal);
    await meal.save();
    console.log('Meal saved successfully');
    
    // Return meal in consistent format
    res.status(201).json({
      id: meal._id,
      type: meal.type,
      name: meal.name,
      calories: meal.calories,
      ingredients: meal.ingredients,
      protein: meal.protein || 0,
      carbs: meal.carbs || 0,
      fat: meal.fat || 0,
      date: meal.date
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete a meal
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Meal ID is required' });
    }

    const meal = await Meal.findOne({ _id: id, userId: req.user.id });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    await meal.deleteOne();
    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /meals/suggestions?tags=vegetarian
router.get('/suggestions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    let query = {};
    if (tags.length > 0) {
      query.tags = { $all: tags };
    }
    let meals = await PredefinedMeal.find(query);
    // Exclude meals with ["fat", "spicy", "oily"] if overweight
    if (user.profile && user.profile.weight - user.profile.targetWeight > 5) {
      meals = meals.filter(meal => !meal.tags.some(tag => ["fat", "spicy", "oily"].includes(tag)));
    }
    // Structured format
    const suggestions = meals.map(meal => {
      const unit = meal.units[0];
      return {
        id: meal._id,
        name: meal.name,
        tags: meal.tags,
        ingredients: meal.ingredients,
        units: Array.isArray(meal.units) ? meal.units : [],
        imageUrl: meal.imageUrl
      };
    });
    res.json(Array.isArray(suggestions) ? suggestions : []);
  } catch (error) {
    console.error('Get meal suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /meals/premium?ingredients=rice,tomato,onion
router.get('/premium', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.isPremium) {
      return res.status(403).json({ message: 'Premium feature only' });
    }
    const ingredients = req.query.ingredients ? req.query.ingredients.split(',') : [];
    if (ingredients.length === 0) {
      return res.status(400).json({ message: 'No ingredients provided' });
    }
    // Find meals where all ingredients are in the provided list
    const meals = await PredefinedMeal.find({
      ingredients: { $not: { $elemMatch: { $nin: ingredients } } }
    });
    const suggestions = meals.map(meal => {
      const unit = meal.units[0];
      return {
        id: meal._id,
        name: meal.name,
        unit: unit.unit,
        calories: unit.calories,
        tags: meal.tags,
        imageUrl: meal.imageUrl
      };
    });
    res.json(suggestions);
  } catch (error) {
    console.error('Get premium meal suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /meals/log
router.post('/log', auth, async (req, res) => {
  try {
    const { name, unit, quantity } = req.body;
    if (!name || !unit || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    // Find the meal and unit
    const meal = await PredefinedMeal.findOne({ name });
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }
    const unitObj = meal.units.find(u => u.unit === unit);
    if (!unitObj) {
      return res.status(400).json({ message: 'Unit not found for this meal' });
    }
    const calories = quantity * unitObj.calories;
    // Log the meal for the user
    const newMeal = new Meal({
      userId: req.user.id,
      name,
      type: 'other',
      calories,
      ingredients: meal.ingredients,
      date: new Date(),
      predefinedMealId: meal._id
    });
    await newMeal.save();
    res.status(201).json({ message: 'Meal logged', meal: newMeal });
  } catch (error) {
    console.error('Log meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /meals/predefined/:id
router.get('/predefined/:id', auth, async (req, res) => {
  try {
    const meal = await PredefinedMeal.findById(req.params.id);
    if (!meal) {
      return res.status(404).json({ message: 'Predefined meal not found' });
    }
    res.json({
      id: meal._id,
      name: meal.name,
      units: meal.units,
      tags: meal.tags,
      ingredients: meal.ingredients,
      imageUrl: meal.imageUrl
    });
  } catch (error) {
    console.error('Get predefined meal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 