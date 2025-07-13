import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import progressService from '../services/progressService';

const FRESH_CALM_LIGHT = {
    primary: '#2ECC71', // Mint Green
    secondary: '#A3E4D7',
    background: '#FDFEFE',
    surface: '#FFFFFF',
    text: '#1C1C1C',
    card: '#FFFFFF',
    border: '#A3E4D7',
    error: '#FF5252',
  };
  const FRESH_CALM_DARK = {
    primary: '#27AE60',
    secondary: '#48C9B0',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FAFAFA',
    card: '#1E1E1E',
    border: '#48C9B0',
    error: '#FF5252',
  };

const { width } = Dimensions.get('window');

const ProgressStatisticsScreen = () => {
    const navigation = useNavigation();
    const { isDark } = useTheme();
    const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
    
    const [loading, setLoading] = useState(true);
    const [dailyData, setDailyData] = useState([]);
    const [weeklyData, setWeeklyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [streaks, setStreaks] = useState({});
    const [insights, setInsights] = useState([]);
    const [statistics, setStatistics] = useState({});
    const [goals, setGoals] = useState({});
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('daily'); // daily, weekly, monthly
    const loadingRef = useRef(false);

  useEffect(() => {
    loadProgressData();
  }, []);

  // Refresh data when screen comes into focus, but prevent multiple calls
  useFocusEffect(
    useCallback(() => {
      if (!loadingRef.current) {
        loadProgressData();
      }
    }, [])
  );

  const loadProgressData = async () => {
    if (loadingRef.current) {
      console.log('Progress data loading already in progress, skipping...');
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      
      console.log('Loading progress data...');
      
      const [daily, weekly, monthly, streaksData, insightsData, statisticsData, goalsData] = await Promise.all([
        progressService.getDailyData().catch(err => {
          console.error('Error fetching daily data:', err);
          return [];
        }),
        progressService.getWeeklyData().catch(err => {
          console.error('Error fetching weekly data:', err);
          return [];
        }),
        progressService.getMonthlyData().catch(err => {
          console.error('Error fetching monthly data:', err);
          return [];
        }),
        progressService.getStreaks().catch(err => {
          console.error('Error fetching streaks:', err);
          return {};
        }),
        progressService.getInsights().catch(err => {
          console.error('Error fetching insights:', err);
          return [];
        }),
        progressService.getDetailedStatistics().catch(err => {
          console.error('Error fetching detailed statistics:', err);
          return {};
        }),
        progressService.getGoals().catch(err => {
          console.error('Error fetching goals:', err);
          return {};
        })
      ]);
      
      setDailyData(daily);
      setWeeklyData(weekly);
      setMonthlyData(monthly);
      setStreaks(streaksData);
      setInsights(insightsData);
      setStatistics(statisticsData);
      setGoals(goalsData);
      
      console.log('Progress data loaded successfully');
    } catch (err) {
      console.error('Error loading progress data:', err);
      setError('Failed to load progress data');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const renderTabSelector = () => (
    <View style={styles.tabContainer}>
      {['daily', 'weekly', 'monthly'].map(tab => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tab,
            activeTab === tab && { backgroundColor: customColors.primary }
          ]}
          onPress={() => setActiveTab(tab)}
        >
          <Text style={[
            styles.tabText,
            { color: activeTab === tab ? 'white' : customColors.text }
          ]}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const getChartData = () => {
    if (activeTab === 'daily') {
      return {
        labels: dailyData.slice(-7).map(day => day.date.slice(5)),
        calories: dailyData.slice(-7).map(day => day.calories),
        water: dailyData.slice(-7).map(day => day.water)
      };
    } else if (activeTab === 'weekly') {
      return {
        labels: weeklyData.slice(-4).map(week => `Week ${week.week}`),
        calories: weeklyData.slice(-4).map(week => week.avgCalories),
        water: weeklyData.slice(-4).map(week => week.avgWater)
      };
    } else {
      return {
        labels: monthlyData.map(month => month.month),
        calories: monthlyData.map(month => month.avgCalories),
        water: monthlyData.map(month => month.avgWater)
      };
    }
  };

  const renderCalorieChart = () => {
    const chartData = getChartData();
    if (chartData.calories.length === 0) return null;
    
    const data = {
      labels: chartData.labels,
      datasets: [{
        data: chartData.calories,
        color: (opacity = 1) => customColors.primary,
        strokeWidth: 2
      }]
    };

    return (
      <LineChart
        data={data}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: customColors.card,
          backgroundGradientFrom: customColors.card,
          backgroundGradientTo: customColors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => customColors.text,
          labelColor: (opacity = 1) => customColors.text,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: customColors.primary
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    );
  };

  const renderWaterChart = () => {
    const chartData = getChartData();
    if (chartData.water.length === 0) return null;
    
    const data = {
      labels: chartData.labels,
      datasets: [{
        data: chartData.water
      }]
    };

    return (
      <BarChart
        data={data}
        width={width - 40}
        height={220}
        chartConfig={{
          backgroundColor: customColors.card,
          backgroundGradientFrom: customColors.card,
          backgroundGradientTo: customColors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => customColors.secondary,
          labelColor: (opacity = 1) => customColors.text,
          style: {
            borderRadius: 16
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    );
  };

  const renderMacroChart = () => {
    if (dailyData.length === 0) return null;
    
    const recentDays = dailyData.slice(-7);
    const avgProtein = Math.round(recentDays.reduce((sum, day) => sum + day.protein, 0) / recentDays.length);
    const avgCarbs = Math.round(recentDays.reduce((sum, day) => sum + day.carbs, 0) / recentDays.length);
    const avgFat = Math.round(recentDays.reduce((sum, day) => sum + day.fat, 0) / recentDays.length);
    
    // Calculate goals based on typical recommendations
    // Protein: 1.6-2.2g per kg body weight (assuming 70kg average)
    // Carbs: 45-65% of total calories (assuming 2000 cal = 225-325g)
    // Fat: 20-35% of total calories (assuming 2000 cal = 44-78g)
    const proteinGoal = 140; // 2g per kg for 70kg person
    const carbsGoal = 250;   // 50% of 2000 calories = 250g
    const fatGoal = 65;      // 30% of 2000 calories = 65g
    
    // Calculate progress percentages (capped at 1.0)
    const proteinProgress = Math.min(avgProtein / proteinGoal, 1.0);
    const carbsProgress = Math.min(avgCarbs / carbsGoal, 1.0);
    const fatProgress = Math.min(avgFat / fatGoal, 1.0);
    
    const data = {
      labels: ['Protein', 'Carbs', 'Fat'],
      data: [proteinProgress, carbsProgress, fatProgress]
    };

    return (
      <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
        <Text style={[styles.cardTitle, { color: customColors.text }]}>Macronutrient Progress (7-day avg)</Text>
        <ProgressChart
          data={data}
          width={width - 80}
          height={180}
          strokeWidth={16}
          radius={32}
          chartConfig={{
            backgroundColor: customColors.card,
            backgroundGradientFrom: customColors.card,
            backgroundGradientTo: customColors.card,
            decimalPlaces: 0,
            color: (opacity = 1) => customColors.text,
            labelColor: (opacity = 1) => customColors.text,
            style: {
              borderRadius: 16
            },
            propsForLabels: {
              fontSize: 12,
              fontWeight: 'bold'
            }
          }}
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
        <View style={styles.macroDetails}>
          <View style={styles.macroDetail}>
            <Text style={[styles.macroLabel, { color: customColors.primary }]}>Protein</Text>
            <Text style={[styles.macroValue, { color: customColors.text }]}>
              {avgProtein}g / {proteinGoal}g ({Math.round(proteinProgress * 100)}%)
            </Text>
          </View>
          <View style={styles.macroDetail}>
            <Text style={[styles.macroLabel, { color: customColors.secondary }]}>Carbs</Text>
            <Text style={[styles.macroValue, { color: customColors.text }]}>
              {avgCarbs}g / {carbsGoal}g ({Math.round(carbsProgress * 100)}%)
            </Text>
          </View>
          <View style={styles.macroDetail}>
            <Text style={[styles.macroLabel, { color: customColors.error }]}>Fat</Text>
            <Text style={[styles.macroValue, { color: customColors.text }]}>
              {avgFat}g / {fatGoal}g ({Math.round(fatProgress * 100)}%)
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderStreaksCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Current Streaks</Text>
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={[styles.streakNumber, { color: customColors.primary }]}>{streaks.calories?.current || 0}</Text>
          <Text style={[styles.streakLabel, { color: customColors.text }]}>Calorie Goal</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={[styles.streakNumber, { color: customColors.secondary }]}>{streaks.water?.current || 0}</Text>
          <Text style={[styles.streakLabel, { color: customColors.text }]}>Water Goal</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={[styles.streakNumber, { color: customColors.primary }]}>{streaks.meals?.current || 0}</Text>
          <Text style={[styles.streakLabel, { color: customColors.text }]}>Meal Logging</Text>
        </View>
      </View>
    </View>
  );

  const renderBestWorstCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Best & Highest Calorie Days</Text>
      <View style={styles.bestWorstContainer}>
        <View style={styles.bestWorstItem}>
          <Text style={[styles.bestWorstLabel, { color: customColors.primary }]}>Best Calorie Day</Text>
          <Text style={[styles.bestWorstValue, { color: customColors.text }]}> 
            {statistics.bestDays?.calories?.date ? 
              `${statistics.bestDays.calories.date.slice(5)} (${statistics.bestDays.calories.value} cal)` : 
              'No data'
            }
          </Text>
        </View>
        <View style={styles.bestWorstItem}>
          <Text style={[styles.bestWorstLabel, { color: customColors.error }]}>Highest Calorie Day</Text>
          <Text style={[styles.bestWorstValue, { color: customColors.text }]}> 
            {statistics.highestDays?.calories?.date ? 
              `${statistics.highestDays.calories.date.slice(5)} (${statistics.highestDays.calories.value} cal)` : 
              'No data'
            }
          </Text>
        </View>
        <View style={styles.bestWorstItem}>
          <Text style={[styles.bestWorstLabel, { color: customColors.secondary }]}>Best Water Day</Text>
          <Text style={[styles.bestWorstValue, { color: customColors.text }]}> 
            {statistics.bestDays?.water?.date ? 
              `${statistics.bestDays.water.date.slice(5)} (${statistics.bestDays.water.value} ml)` : 
              'No data'
            }
          </Text>
        </View>
        <View style={styles.bestWorstItem}>
          <Text style={[styles.bestWorstLabel, { color: customColors.error }]}>Lowest Water Day</Text>
          <Text style={[styles.bestWorstValue, { color: customColors.text }]}> 
            {statistics.worstDays?.water?.date ? 
              `${statistics.worstDays.water.date.slice(5)} (${statistics.worstDays.water.value} ml)` : 
              'No data'
            }
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAveragesCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Averages</Text>
      
      <View style={styles.averagesContainer}>
        <View style={styles.averageItem}>
          <Text style={[styles.averageLabel, { color: customColors.primary }]}>Calories</Text>
          <Text style={[styles.averageValue, { color: customColors.text }]}>
            {statistics.averages?.calories || 0} cal
          </Text>
        </View>
        
        <View style={styles.averageItem}>
          <Text style={[styles.averageLabel, { color: customColors.secondary }]}>Water</Text>
          <Text style={[styles.averageValue, { color: customColors.text }]}>
            {statistics.averages?.water || 0} ml
          </Text>
        </View>
        
        <View style={styles.averageItem}>
          <Text style={[styles.averageLabel, { color: customColors.primary }]}>Protein</Text>
          <Text style={[styles.averageValue, { color: customColors.text }]}>
            {statistics.averages?.protein || 0} g
          </Text>
        </View>
        
        <View style={styles.averageItem}>
          <Text style={[styles.averageLabel, { color: customColors.primary }]}>Carbs</Text>
          <Text style={[styles.averageValue, { color: customColors.text }]}>
            {statistics.averages?.carbs || 0} g
          </Text>
        </View>
        
        <View style={styles.averageItem}>
          <Text style={[styles.averageLabel, { color: customColors.primary }]}>Fat</Text>
          <Text style={[styles.averageValue, { color: customColors.text }]}>
            {statistics.averages?.fat || 0} g
          </Text>
        </View>
      </View>
    </View>
  );

  const renderGoalAchievementCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Goal Achievement</Text>
      
      <View style={styles.goalContainer}>
        <View style={styles.goalItem}>
          <Text style={[styles.goalLabel, { color: customColors.primary }]}>Calorie Goal</Text>
          <Text style={[styles.goalValue, { color: customColors.text }]}>
            {statistics.goalAchievement?.calories?.percentage || 0}%
          </Text>
          <Text style={[styles.goalSubtext, { color: customColors.text }]}>
            {statistics.goalAchievement?.calories?.daysMet || 0} of {statistics.goalAchievement?.calories?.totalDays || 0} days
          </Text>
        </View>
        
        <View style={styles.goalItem}>
          <Text style={[styles.goalLabel, { color: customColors.secondary }]}>Water Goal</Text>
          <Text style={[styles.goalValue, { color: customColors.text }]}>
            {statistics.goalAchievement?.water?.percentage || 0}%
          </Text>
          <Text style={[styles.goalSubtext, { color: customColors.text }]}>
            {statistics.goalAchievement?.water?.daysMet || 0} of {statistics.goalAchievement?.water?.totalDays || 0} days
          </Text>
        </View>
      </View>
    </View>
  );

  const renderActivityCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Activity Summary</Text>
      
      <View style={styles.activityContainer}>
        <View style={styles.activityItem}>
          <Text style={[styles.activityLabel, { color: customColors.primary }]}>Days Tracked</Text>
          <Text style={[styles.activityValue, { color: customColors.text }]}>
            {statistics.activity?.totalDaysTracked || 0}
          </Text>
        </View>
        
        <View style={styles.activityItem}>
          <Text style={[styles.activityLabel, { color: customColors.primary }]}>Meals Logged</Text>
          <Text style={[styles.activityValue, { color: customColors.text }]}>
            {statistics.activity?.totalMealsLogged || 0}
          </Text>
        </View>
        
        <View style={styles.activityItem}>
          <Text style={[styles.activityLabel, { color: customColors.secondary }]}>Water Logs</Text>
          <Text style={[styles.activityValue, { color: customColors.text }]}>
            {statistics.activity?.totalWaterLogs || 0}
          </Text>
        </View>
        
        <View style={styles.activityItem}>
          <Text style={[styles.activityLabel, { color: customColors.primary }]}>Consistency</Text>
          <Text style={[styles.activityValue, { color: customColors.text }]}>
            {statistics.activity?.consistency || 0}%
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInsightsCard = () => (
    <View style={[styles.card, { backgroundColor: customColors.card, borderColor: customColors.border }]}>
      <Text style={[styles.cardTitle, { color: customColors.text }]}>Insights</Text>
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <Text key={index} style={[styles.insightText, { color: customColors.text }]}>
            • {insight}
          </Text>
        ))
      ) : (
        <Text style={[styles.insightText, { color: customColors.text }]}>
          Start logging your meals and water to get personalized insights!
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={customColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: customColors.text }]}>Progress Statistics</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primary} />
          <Text style={[styles.loadingText, { color: customColors.text }]}>Loading progress data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: customColors.text }]}>Progress Statistics</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {error && (
          <View style={[styles.errorCard, { backgroundColor: customColors.error + '20' }]}>
            <Text style={[styles.errorText, { color: customColors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: customColors.primary }]}
              onPress={loadProgressData}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderTabSelector()}

        <Text style={[styles.section, { color: customColors.text }]}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Calorie Intake
        </Text>
        {renderCalorieChart()}

        <Text style={[styles.section, { color: customColors.text }]}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Water Intake
        </Text>
        {renderWaterChart()}

        <Text style={[styles.section, { color: customColors.text }]}>Macronutrient Distribution (Last 7 Days)</Text>
        {renderMacroChart()}

        {renderStreaksCard()}
        {renderBestWorstCard()}
        {renderAveragesCard()}
        {renderGoalAchievementCard()}
        {renderActivityCard()}
        {renderInsightsCard()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    marginVertical: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  streakItem: {
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  streakLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  bestWorstContainer: {
    gap: 12,
  },
  bestWorstItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bestWorstLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bestWorstValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  averagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  averageItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  averageLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalContainer: {
    gap: 16,
  },
  goalItem: {
    alignItems: 'center',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  goalSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },
  activityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  errorCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  macroDetails: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroDetail: {
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProgressStatisticsScreen;
