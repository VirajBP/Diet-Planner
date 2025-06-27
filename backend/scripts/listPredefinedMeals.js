const mongoose = require('mongoose');
const PredefinedMeal = require('../models/PredefinedMeal');

async function list() {
  await mongoose.connect('mongodb://localhost:27017/diet-planner');
  const meals = await PredefinedMeal.find({}, '_id name');
  console.log(meals);
  await mongoose.disconnect();
}

list(); 