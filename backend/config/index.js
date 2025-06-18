require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/diet-planner',
  jwtSecret: process.env.JWT_SECRET || 'diet_planner_default_jwt_secret_key_2024',
  jwtExpiresIn: '7d',
}; 