const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const User = require('../models/User');

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
    res.status(201).json(meal);
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

// Get meal suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const dietaryRestrictions = user.profile?.dietaryRestrictions || [];
    
    // Basic meal suggestions by type
    const suggestions = {
      breakfast: [
        { name: 'Oatmeal with Fruits', calories: 250, ingredients: ['oats', 'banana', 'honey'] },
        { name: 'Greek Yogurt Parfait', calories: 300, ingredients: ['yogurt', 'granola', 'berries'] },
        { name: 'Whole Grain Toast with Avocado', calories: 280, ingredients: ['bread', 'avocado', 'eggs'] }
      ],
      lunch: [
        { name: 'Grilled Chicken Salad', calories: 350, ingredients: ['chicken', 'lettuce', 'tomatoes'] },
        { name: 'Quinoa Bowl', calories: 400, ingredients: ['quinoa', 'vegetables', 'chickpeas'] },
        { name: 'Turkey Wrap', calories: 320, ingredients: ['turkey', 'tortilla', 'vegetables'] }
      ],
      dinner: [
        { name: 'Baked Salmon', calories: 450, ingredients: ['salmon', 'rice', 'vegetables'] },
        { name: 'Vegetable Stir-Fry', calories: 300, ingredients: ['tofu', 'mixed vegetables', 'rice'] },
        { name: 'Lean Beef with Sweet Potato', calories: 500, ingredients: ['beef', 'sweet potato', 'broccoli'] }
      ],
      snack: [
        { name: 'Mixed Nuts', calories: 160, ingredients: ['almonds', 'walnuts', 'cashews'] },
        { name: 'Apple with Peanut Butter', calories: 200, ingredients: ['apple', 'peanut butter'] },
        { name: 'Hummus with Carrots', calories: 150, ingredients: ['hummus', 'carrots'] }
      ]
    };

    // Filter suggestions based on dietary restrictions
    if (dietaryRestrictions.length > 0) {
      Object.keys(suggestions).forEach(mealType => {
        suggestions[mealType] = suggestions[mealType].filter(meal => {
          return !meal.ingredients.some(ingredient => 
            dietaryRestrictions.some(restriction => 
              ingredient.toLowerCase().includes(restriction.toLowerCase())
            )
          );
        });
      });
    }

    res.json(suggestions);
  } catch (error) {
    console.error('Get meal suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 