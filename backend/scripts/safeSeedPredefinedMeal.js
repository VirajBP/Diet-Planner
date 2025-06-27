const mongoose = require('mongoose');
const PredefinedMeal = require('../models/PredefinedMeal');
const config = require('../config');

async function setAllMealsToFree() {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB");

    const result = await PredefinedMeal.updateMany(
      { isPremium: { $exists: false } },
      { $set: { isPremium: false } }
    );

    console.log(`✅ Updated ${result.modifiedCount || result.nModified} meals to have isPremium: false`);
  } catch (error) {
    console.error('❌ Error updating meals:', error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

if (require.main === module) {
  setAllMealsToFree().then(() => process.exit(0));
}
