const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PredefinedMeal = require('../models/PredefinedMeal');
const searchService = require('../services/searchService');
const fetch = require('node-fetch');

// Test endpoint to list all predefined meals (for debugging)
router.get('/all', auth, async (req, res) => {
  try {
    const meals = await PredefinedMeal.find({}).limit(20);
    res.json({
      count: meals.length,
      meals: meals
    });
  } catch (error) {
    console.error('Get all meals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search for nutrition information with enhanced search
router.get('/search', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    console.log('Enhanced search for:', query);
    
    // Use the comprehensive search service
    const searchResults = await searchService.searchMeals(query, 15);
    
    console.log(`Found ${searchResults.length} results with enhanced search`);

    // If no results in predefined meals, try external API
    if (searchResults.length === 0) {
      try {
        // Using a free nutrition API (you can replace with your preferred API)
        const response = await fetch(`https://api.edamam.com/api/food-database/v2/parser?app_id=${process.env.EDAMAM_APP_ID}&app_key=${process.env.EDAMAM_APP_KEY}&ingr=${encodeURIComponent(query)}`);
        
        if (response.ok) {
          const data = await response.json();
          return res.json({
            source: 'external',
            meals: data.hints || [],
            searchInfo: {
              query,
              strategy: 'external_api',
              resultsCount: data.hints?.length || 0
            }
          });
        }
      } catch (error) {
        console.error('External API error:', error);
      }
    }

    res.json({
      source: 'predefined',
      meals: searchResults,
      searchInfo: {
        query,
        strategy: 'enhanced_search',
        resultsCount: searchResults.length,
        relevanceScores: searchResults.map(meal => ({
          name: meal.name,
          relevance: meal.relevance
        }))
      }
    });
  } catch (error) {
    console.error('Enhanced nutrition search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get search suggestions
router.get('/suggestions', auth, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ suggestions: [] });
    }
    
    const suggestions = await searchService.getSuggestions(query, 5);
    res.json({ suggestions });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nutrition info for a specific meal
router.get('/meal/:id', auth, async (req, res) => {
  try {
    const meal = await PredefinedMeal.findById(req.params.id);
    
    if (!meal) {
      return res.status(404).json({ message: 'Meal not found' });
    }

    res.json(meal);
  } catch (error) {
    console.error('Get meal nutrition error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nutrition summary for user's meals
router.get('/summary', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    // This would need to be implemented based on your meal logging structure
    // For now, returning a placeholder
    res.json({
      date: startDate.toISOString().split('T')[0],
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: []
    });
  } catch (error) {
    console.error('Nutrition summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 