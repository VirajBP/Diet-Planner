import dotenv from 'dotenv/config';
export const MONGODB_CONFIG = {
  // This will be replaced with your actual MongoDB URL
  MONGODB_URI: process.env.MONGODB_URI,
  // Database name
  DB_NAME: 'diet_planner',
  // Collection names
  COLLECTIONS: {
    USERS: 'users',
    MEALS: 'meals',
    USER_MEAL_LOGS: 'user_meal_logs',
    WATER_LOGS: 'water_logs',
    GROCERY_LISTS: 'grocery_lists',
    WEIGHT_LOGS: 'weight_logs'
  }
}; 