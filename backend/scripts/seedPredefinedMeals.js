const mongoose = require('mongoose');
const PredefinedMeal = require('../models/PredefinedMeal');
const predefinedMealsData = require('../../predefinedMeals_tagged_fixed.json');
const config = require('../config');

const seedPredefinedMeals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing predefined meals
    await PredefinedMeal.deleteMany({});
    console.log('Cleared existing predefined meals');

    // Process and insert meals with enhanced search data
    const enhancedMeals = predefinedMealsData.map(meal => {
      // Remove the _id field to let MongoDB generate new IDs
      const { _id, ...mealWithoutId } = meal;
      
      // Generate search-friendly fields
      const searchName = meal.name.toLowerCase();
      const keywords = new Set();
      
      // Add name words
      const nameWords = meal.name.toLowerCase().split(/\s+/);
      nameWords.forEach(word => {
        if (word.length > 2) {
          keywords.add(word);
        }
      });
      
      // Add ingredient words
      if (meal.ingredients) {
        meal.ingredients.forEach(ingredient => {
          const ingredientWords = ingredient.toLowerCase().split(/\s+/);
          ingredientWords.forEach(word => {
            if (word.length > 2) {
              keywords.add(word);
            }
          });
        });
      }
      
      // Add tags
      if (meal.tags) {
        meal.tags.forEach(tag => {
          keywords.add(tag.toLowerCase());
        });
      }
      
      // Add category
      if (meal.category) {
        keywords.add(meal.category.toLowerCase());
      }

      return {
        ...mealWithoutId,
        searchName,
        searchKeywords: Array.from(keywords)
      };
    });

    // Insert enhanced meals
    const result = await PredefinedMeal.insertMany(enhancedMeals);
    console.log(`Successfully seeded ${result.length} predefined meals`);

    // Log some examples to verify search fields
    result.slice(0, 3).forEach(meal => {
      console.log(`- ${meal.name} (lunch)`);
      console.log(`  Search keywords: ${meal.searchKeywords.join(', ')}`);
    });

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding predefined meals:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seeding function
seedPredefinedMeals(); 