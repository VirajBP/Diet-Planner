const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Meal = require('../models/Meal');
const WaterLog = require('../models/WaterLog');
const WeightLog = require('../models/WeightLog');
const User = require('../models/User');

// Constants for calorie calculations
const WEIGHT_LOSS_DEFICIT = 500; // 500 calorie deficit for weight loss
const WEIGHT_GAIN_SURPLUS = 500; // 500 calorie surplus for weight gain

// Get progress statistics for the last 30 days
router.get('/statistics', auth, async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get meals data (90 days for monthly analysis)
    const meals = await Meal.find({
      userId: req.user.id,
      date: { $gte: ninetyDaysAgo }
    }).sort({ date: 1 });

    // Get water logs data (90 days for monthly analysis)
    const waterLogs = await WaterLog.find({
      userId: req.user.id,
      createdAt: { $gte: ninetyDaysAgo }
    }).sort({ createdAt: 1 });

    // Get weight logs data (90 days for monthly analysis)
    const weightLogs = await WeightLog.find({
      userId: req.user.id,
      createdAt: { $gte: ninetyDaysAgo }
    }).sort({ createdAt: 1 });

    // Process meals data by date
    const mealsByDate = {};
    meals.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      console.log(`Processing meal: ${meal.name} on ${dateStr} with calories: ${meal.calories}`);
      if (!mealsByDate[dateStr]) {
        mealsByDate[dateStr] = {
          date: dateStr,
          totalCalories: 0,
          totalProtein: 0,
          totalCarbs: 0,
          totalFat: 0,
          mealCount: 0
        };
      }
      mealsByDate[dateStr].totalCalories += meal.calories || 0;
      mealsByDate[dateStr].totalProtein += meal.protein || 0;
      mealsByDate[dateStr].totalCarbs += meal.carbs || 0;
      mealsByDate[dateStr].totalFat += meal.fat || 0;
      mealsByDate[dateStr].mealCount += 1;
    });

    console.log('Meals by date:', Object.keys(mealsByDate).map(date => ({
      date,
      mealCount: mealsByDate[date].mealCount,
      calories: mealsByDate[date].totalCalories
    })));

    // Process water logs data by date
    const waterByDate = {};
    waterLogs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      if (!waterByDate[dateStr]) {
        waterByDate[dateStr] = {
          date: dateStr,
          totalWater: 0,
          logCount: 0
        };
      }
      waterByDate[dateStr].totalWater += log.amount || 0;
      waterByDate[dateStr].logCount += 1;
    });

    // Process weight logs data by date
    const weightByDate = {};
    weightLogs.forEach(log => {
      const dateStr = log.createdAt.toISOString().split('T')[0];
      weightByDate[dateStr] = {
        date: dateStr,
        weight: log.weight || 0
      };
    });

    // Generate daily data for the last 90 days
    const dailyData = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayData = {
        date: dateStr,
        calories: mealsByDate[dateStr]?.totalCalories || 0,
        protein: mealsByDate[dateStr]?.totalProtein || 0,
        carbs: mealsByDate[dateStr]?.totalCarbs || 0,
        fat: mealsByDate[dateStr]?.totalFat || 0,
        mealCount: mealsByDate[dateStr]?.mealCount || 0,
        water: waterByDate[dateStr]?.totalWater || 0,
        waterLogCount: waterByDate[dateStr]?.logCount || 0,
        weight: weightByDate[dateStr]?.weight || null
      };
      
      // Debug logging for recent days
      if (i < 7) {
        console.log(`Day ${i}: ${dateStr} - meals: ${dayData.mealCount}, calories: ${dayData.calories}`);
      }
      
      dailyData.push(dayData);
    }

    // Generate monthly data (last 3 months)
    const monthlyData = [];
    for (let month = 2; month >= 0; month--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - month);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthDays = dailyData.filter(day => {
        const dayDate = new Date(day.date);
        return dayDate >= monthStart && dayDate <= monthEnd;
      });
      
      if (monthDays.length > 0) {
        monthlyData.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          avgCalories: Math.round(monthDays.reduce((sum, day) => sum + day.calories, 0) / monthDays.length),
          avgWater: Math.round(monthDays.reduce((sum, day) => sum + day.water, 0) / monthDays.length),
          totalMeals: monthDays.reduce((sum, day) => sum + day.mealCount, 0),
          avgProtein: Math.round(monthDays.reduce((sum, day) => sum + day.protein, 0) / monthDays.length),
          avgCarbs: Math.round(monthDays.reduce((sum, day) => sum + day.carbs, 0) / monthDays.length),
          avgFat: Math.round(monthDays.reduce((sum, day) => sum + day.fat, 0) / monthDays.length),
          daysWithData: monthDays.filter(day => day.calories > 0 || day.water > 0).length
        });
      }
    }

    // Calculate weekly averages (last 12 weeks)
    const weeklyData = [];
    for (let week = 0; week < 12; week++) {
      const weekStart = week * 7;
      const weekEnd = weekStart + 6;
      const weekDays = dailyData.slice(weekStart, weekEnd + 1);
      
      if (weekDays.length > 0) {
        const weekAvg = {
          week: week + 1,
          avgCalories: Math.round(weekDays.reduce((sum, day) => sum + day.calories, 0) / weekDays.length),
          avgProtein: Math.round(weekDays.reduce((sum, day) => sum + day.protein, 0) / weekDays.length),
          avgCarbs: Math.round(weekDays.reduce((sum, day) => sum + day.carbs, 0) / weekDays.length),
          avgFat: Math.round(weekDays.reduce((sum, day) => sum + day.fat, 0) / weekDays.length),
          avgWater: Math.round(weekDays.reduce((sum, day) => sum + day.water, 0) / weekDays.length),
          totalMeals: weekDays.reduce((sum, day) => sum + day.mealCount, 0),
          daysWithWeight: weekDays.filter(day => day.weight !== null).length,
          daysWithData: weekDays.filter(day => day.calories > 0 || day.water > 0).length
        };
        weeklyData.push(weekAvg);
      }
    }

    // Calculate streaks and insights
    const user = await User.findById(req.user.id);
    
    // Calculate goal calories based on user profile
    let goalCalories = 2000; // Default
    if (user?.profile) {
      const bmr = user.profile.gender === 'male' 
        ? 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age + 5
        : 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age - 161;
      
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };
      
      const tdee = bmr * activityMultipliers[user.profile.activityLevel] || 1.375;
      
      if (user.profile.goal === 'lose') {
        goalCalories = Math.round(tdee - WEIGHT_LOSS_DEFICIT);
      } else if (user.profile.goal === 'gain') {
        goalCalories = Math.round(tdee + WEIGHT_GAIN_SURPLUS);
      } else {
        goalCalories = Math.round(tdee);
      }
    }
    
    // Calculate goal water (30ml per kg of body weight)
    const goalWater = user?.profile?.weight ? Math.round(user.profile.weight * 30) : 2000;

    const calorieStreak = calculateStreak(dailyData, 'calories', goalCalories);
    const waterStreak = calculateStreak(dailyData, 'water', goalWater);
    const mealStreak = calculateStreak(dailyData, 'mealCount', 1);

    // Generate insights and statistics
    const insights = generateInsights(dailyData, weeklyData, user);
    const statistics = generateStatistics(dailyData, weeklyData, monthlyData, user);

    res.json({
      dailyData,
      weeklyData,
      monthlyData,
      streaks: {
        calories: calorieStreak,
        water: waterStreak,
        meals: mealStreak
      },
      insights,
      statistics,
      goals: {
        calories: goalCalories,
        water: goalWater
      }
    });

  } catch (error) {
    console.error('Get progress statistics error:', error);
    res.status(500).json({ message: 'Failed to fetch progress statistics' });
  }
});

// Helper function to calculate streaks
function calculateStreak(data, field, goal) {
  let currentStreak = 0;
  let maxStreak = 0;
  
  console.log(`Calculating streak for ${field} with goal ${goal}`);
  console.log(`Data points: ${data.length}`);
  
  for (let i = data.length - 1; i >= 0; i--) {
    const value = data[i][field];
    const date = data[i].date;
    console.log(`Day ${i}: ${date} - ${field}: ${value}, goal: ${goal}`);
    
    if (value >= goal) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
      console.log(`  ✓ Streak continues: ${currentStreak}`);
    } else {
      console.log(`  ✗ Streak broken: ${currentStreak}`);
      currentStreak = 0;
    }
  }
  
  console.log(`Final streak for ${field}: current=${currentStreak}, max=${maxStreak}`);
  
  return {
    current: currentStreak,
    max: maxStreak
  };
}

// Helper function to generate insights
function generateInsights(dailyData, weeklyData, user) {
  const insights = [];
  
  // Calculate averages
  const avgCalories = dailyData.reduce((sum, day) => sum + day.calories, 0) / dailyData.length;
  const avgWater = dailyData.reduce((sum, day) => sum + day.water, 0) / dailyData.length;
  
  // Calculate goal calories based on user profile
  let goalCalories = 2000; // Default
  if (user?.profile) {
    const bmr = user.profile.gender === 'male' 
      ? 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age + 5
      : 10 * user.profile.weight + 6.25 * user.profile.height - 5 * user.profile.age - 161;
    
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const tdee = bmr * activityMultipliers[user.profile.activityLevel] || 1.375;
    
    if (user.profile.goal === 'lose') {
      goalCalories = Math.round(tdee - WEIGHT_LOSS_DEFICIT);
    } else if (user.profile.goal === 'gain') {
      goalCalories = Math.round(tdee + WEIGHT_GAIN_SURPLUS);
    } else {
      goalCalories = Math.round(tdee);
    }
  }
  
  // Calculate goal water (30ml per kg of body weight)
  const goalWater = user?.profile?.weight ? Math.round(user.profile.weight * 30) : 2000;
  
  // Calorie insights
  if (avgCalories < goalCalories * 0.8) {
    insights.push("You're consistently eating below your calorie goal. Consider adding healthy snacks.");
  } else if (avgCalories > goalCalories * 1.2) {
    insights.push("You're consistently eating above your calorie goal. Try portion control strategies.");
  }
  
  // Water insights
  if (avgWater < goalWater * 0.7) {
    insights.push("You're not drinking enough water. Try setting reminders throughout the day.");
  }
  
  // Weekend vs weekday patterns
  const weekdayCalories = dailyData.filter((_, index) => index % 7 < 5).reduce((sum, day) => sum + day.calories, 0) / 20;
  const weekendCalories = dailyData.filter((_, index) => index % 7 >= 5).reduce((sum, day) => sum + day.calories, 0) / 10;
  
  if (weekendCalories > weekdayCalories * 1.3) {
    insights.push("You tend to eat more calories on weekends. Consider meal planning for weekends.");
  }
  
  // Best and worst days
  const bestDay = dailyData.reduce((best, day) => day.calories > best.calories ? day : best);
  const worstDay = dailyData.reduce((worst, day) => day.calories < worst.calories ? day : worst);
  
  insights.push(`Your best day was ${bestDay.date} with ${bestDay.calories} calories`);
  insights.push(`Your lowest day was ${worstDay.date} with ${worstDay.calories} calories`);
  
  return insights;
}

// Helper function to generate comprehensive statistics
function generateStatistics(dailyData, weeklyData, monthlyData, user) {
  const daysWithData = dailyData.filter(day => day.calories > 0 || day.water > 0);
  const daysWithCalories = dailyData.filter(day => day.calories > 0);
  const daysWithWater = dailyData.filter(day => day.water > 0);

  // Calculate goal calories
  const goalCalories = user?.profile ? calculateGoalCalories(user.profile) : 2000;

  // Best Calorie Day: lowest calories at or above goal
  const bestCalorieDay = daysWithCalories
    .filter(day => day.calories >= goalCalories)
    .reduce((best, day) => (day.calories < best.calories ? day : best), { calories: Infinity, date: '' });
  const bestCalorieDayValid = bestCalorieDay.calories !== Infinity;

  // Highest Calorie Day: highest calories above goal
  const highestCalorieDay = daysWithCalories
    .filter(day => day.calories > goalCalories)
    .reduce((highest, day) => (day.calories > highest.calories ? day : highest), { calories: -Infinity, date: '' });
  const highestCalorieDayValid = highestCalorieDay.calories !== -Infinity;

  // Best and worst water days (unchanged)
  const bestWaterDay = daysWithWater.reduce((best, day) => 
    day.water > best.water ? day : best, { water: 0, date: '' });
  const worstWaterDay = daysWithWater.reduce((worst, day) => 
    day.water < worst.water ? day : worst, { water: Infinity, date: '' });

  // Calculate averages (unchanged)
  const avgCalories = daysWithCalories.length > 0 ? 
    Math.round(daysWithCalories.reduce((sum, day) => sum + day.calories, 0) / daysWithCalories.length) : 0;
  const avgWater = daysWithWater.length > 0 ? 
    Math.round(daysWithWater.reduce((sum, day) => sum + day.water, 0) / daysWithWater.length) : 0;

  // Calculate goal achievement percentages (unchanged)
  const goalWater = user?.profile?.weight ? Math.round(user.profile.weight * 30) : 2000;
  const calorieGoalDays = daysWithCalories.filter(day => day.calories >= goalCalories).length;
  const waterGoalDays = daysWithWater.filter(day => day.water >= goalWater).length;
  const calorieGoalPercentage = daysWithCalories.length > 0 ? 
    Math.round((calorieGoalDays / daysWithCalories.length) * 100) : 0;
  const waterGoalPercentage = daysWithWater.length > 0 ? 
    Math.round((waterGoalDays / daysWithWater.length) * 100) : 0;

  // Trends (unchanged)
  const recentDays = dailyData.slice(-7);
  const previousDays = dailyData.slice(-14, -7);
  const recentAvgCalories = recentDays.length > 0 ? 
    recentDays.reduce((sum, day) => sum + day.calories, 0) / recentDays.length : 0;
  const previousAvgCalories = previousDays.length > 0 ? 
    previousDays.reduce((sum, day) => sum + day.calories, 0) / previousDays.length : 0;
  const recentAvgWater = recentDays.length > 0 ? 
    recentDays.reduce((sum, day) => sum + day.water, 0) / recentDays.length : 0;
  const previousAvgWater = previousDays.length > 0 ? 
    previousDays.reduce((sum, day) => sum + day.water, 0) / previousDays.length : 0;
  const calorieTrend = previousAvgCalories > 0 ? 
    Math.round(((recentAvgCalories - previousAvgCalories) / previousAvgCalories) * 100) : 0;
  const waterTrend = previousAvgWater > 0 ? 
    Math.round(((recentAvgWater - previousAvgWater) / previousAvgWater) * 100) : 0;

  return {
    bestDays: {
      calories: bestCalorieDayValid ? { date: bestCalorieDay.date, value: bestCalorieDay.calories } : null,
      water: { date: bestWaterDay.date, value: bestWaterDay.water }
    },
    highestDays: {
      calories: highestCalorieDayValid ? { date: highestCalorieDay.date, value: highestCalorieDay.calories } : null
    },
    worstDays: {
      water: { date: worstWaterDay.date, value: worstWaterDay.water }
    },
    averages: {
      calories: avgCalories,
      water: avgWater,
      protein: daysWithCalories.length > 0 ? 
        Math.round(daysWithCalories.reduce((sum, day) => sum + day.protein, 0) / daysWithCalories.length) : 0,
      carbs: daysWithCalories.length > 0 ? 
        Math.round(daysWithCalories.reduce((sum, day) => sum + day.carbs, 0) / daysWithCalories.length) : 0,
      fat: daysWithCalories.length > 0 ? 
        Math.round(daysWithCalories.reduce((sum, day) => sum + day.fat, 0) / daysWithCalories.length) : 0
    },
    goalAchievement: {
      calories: {
        percentage: calorieGoalPercentage,
        daysMet: calorieGoalDays,
        totalDays: daysWithCalories.length
      },
      water: {
        percentage: waterGoalPercentage,
        daysMet: waterGoalDays,
        totalDays: daysWithWater.length
      }
    },
    trends: {
      calories: calorieTrend,
      water: waterTrend
    },
    activity: {
      totalDaysTracked: daysWithData.length,
      totalMealsLogged: daysWithData.reduce((sum, day) => sum + day.mealCount, 0),
      totalWaterLogs: daysWithData.reduce((sum, day) => sum + day.waterLogCount, 0),
      consistency: Math.round((daysWithData.length / dailyData.length) * 100)
    }
  };
}

// Helper function to calculate goal calories
function calculateGoalCalories(profile) {
  const bmr = profile.gender === 'male' 
    ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
  
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = bmr * activityMultipliers[profile.activityLevel] || 1.375;
  
  if (profile.goal === 'lose') {
    return Math.round(tdee - WEIGHT_LOSS_DEFICIT);
  } else if (profile.goal === 'gain') {
    return Math.round(tdee + WEIGHT_GAIN_SURPLUS);
  } else {
    return Math.round(tdee);
  }
}

module.exports = router; 