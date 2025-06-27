const mongoose = require('mongoose');
const MealPackage = require('../models/MealPackage');
const PredefinedMeal = require('../models/PredefinedMeal');

async function seed() {
  try {
    await mongoose.connect('mongodb://localhost:27017/diet-planner', { useNewUrlParser: true, useUnifiedTopology: true });
    
    // First, let's find some actual predefined meals
    const breakfastMeals = await PredefinedMeal.find({ category: 'breakfast' }).limit(2);
    const lunchMeals = await PredefinedMeal.find({ category: 'lunch' }).limit(2);
    const snackMeals = await PredefinedMeal.find({ category: 'snack' }).limit(2);
    const dinnerMeals = await PredefinedMeal.find({ category: 'dinner' }).limit(2);
    
    console.log('Found meals:', {
      breakfast: breakfastMeals.length,
      lunch: lunchMeals.length,
      snack: snackMeals.length,
      dinner: dinnerMeals.length
    });
    
    if (breakfastMeals.length === 0 || lunchMeals.length === 0 || snackMeals.length === 0 || dinnerMeals.length === 0) {
      console.log('Not enough predefined meals found. Creating sample packages with placeholder IDs...');
      
      const packages = [
        {
          title: 'Weight Loss Starter',
          goal: 'lose',
          tags: ['vegetarian'],
          totalCalories: 1500,
          meals: [
            { meal: new mongoose.Types.ObjectId(), quantity: 1, unit: 'plate', category: 'breakfast' },
            { meal: new mongoose.Types.ObjectId(), quantity: 1, unit: 'bowl', category: 'lunch' },
            { meal: new mongoose.Types.ObjectId(), quantity: 1, unit: 'piece', category: 'snack' },
            { meal: new mongoose.Types.ObjectId(), quantity: 1, unit: 'plate', category: 'dinner' },
          ]
        },
        {
          title: 'Balanced Maintenance',
          goal: 'maintain',
          tags: ['vegan'],
          totalCalories: 2000,
          meals: [
            { meal: new mongoose.Types.ObjectId(), quantity: 2, unit: 'plate', category: 'breakfast' },
            { meal: new mongoose.Types.ObjectId(), quantity: 2, unit: 'bowl', category: 'lunch' },
            { meal: new mongoose.Types.ObjectId(), quantity: 2, unit: 'piece', category: 'snack' },
            { meal: new mongoose.Types.ObjectId(), quantity: 2, unit: 'plate', category: 'dinner' },
          ]
        },
        {
          title: 'Muscle Gain Plan',
          goal: 'gain',
          tags: ['halal'],
          totalCalories: 2500,
          meals: [
            { meal: new mongoose.Types.ObjectId(), quantity: 3, unit: 'plate', category: 'breakfast' },
            { meal: new mongoose.Types.ObjectId(), quantity: 3, unit: 'bowl', category: 'lunch' },
            { meal: new mongoose.Types.ObjectId(), quantity: 3, unit: 'piece', category: 'snack' },
            { meal: new mongoose.Types.ObjectId(), quantity: 3, unit: 'plate', category: 'dinner' },
          ]
        }
      ];
      
      await MealPackage.deleteMany({});
      await MealPackage.insertMany(packages);
      console.log('Seeded meal packages with placeholder meal IDs!');
    } else {
      // Use actual meal IDs
      const packages = [
        {
          title: 'Weight Loss Starter',
          goal: 'lose',
          tags: ['vegetarian'],
          totalCalories: 1500,
          meals: [
            { meal: breakfastMeals[0]._id, quantity: 1, unit: 'plate', category: 'breakfast' },
            { meal: lunchMeals[0]._id, quantity: 1, unit: 'bowl', category: 'lunch' },
            { meal: snackMeals[0]._id, quantity: 1, unit: 'piece', category: 'snack' },
            { meal: dinnerMeals[0]._id, quantity: 1, unit: 'plate', category: 'dinner' },
          ]
        },
        {
          title: 'Balanced Maintenance',
          goal: 'maintain',
          tags: ['vegan'],
          totalCalories: 2000,
          meals: [
            { meal: breakfastMeals[1] ? breakfastMeals[1]._id : breakfastMeals[0]._id, quantity: 2, unit: 'plate', category: 'breakfast' },
            { meal: lunchMeals[1] ? lunchMeals[1]._id : lunchMeals[0]._id, quantity: 2, unit: 'bowl', category: 'lunch' },
            { meal: snackMeals[1] ? snackMeals[1]._id : snackMeals[0]._id, quantity: 2, unit: 'piece', category: 'snack' },
            { meal: dinnerMeals[1] ? dinnerMeals[1]._id : dinnerMeals[0]._id, quantity: 2, unit: 'plate', category: 'dinner' },
          ]
        },
        {
          title: 'Muscle Gain Plan',
          goal: 'gain',
          tags: ['halal'],
          totalCalories: 2500,
          meals: [
            { meal: breakfastMeals[0]._id, quantity: 3, unit: 'plate', category: 'breakfast' },
            { meal: lunchMeals[0]._id, quantity: 3, unit: 'bowl', category: 'lunch' },
            { meal: snackMeals[0]._id, quantity: 3, unit: 'piece', category: 'snack' },
            { meal: dinnerMeals[0]._id, quantity: 3, unit: 'plate', category: 'dinner' },
          ]
        }
      ];
      
      await MealPackage.deleteMany({});
      await MealPackage.insertMany(packages);
      console.log('Seeded meal packages with actual meal IDs!');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding meal packages:', error);
    process.exit(1);
  }
}

seed(); 