import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryTheme, VictoryTooltip } from 'victory-native';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [weightData, setWeightData] = useState([]);
  const [calorieData, setCalorieData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load weight data
      const weightLogs = await mongodbService.getWeightLogs();
      
      // Load calorie data (this would need to be implemented in your backend)
      // For now, using mock data
      const mockCalorieData = generateMockCalorieData();
      
      processWeightData(weightLogs);
      setCalorieData(mockCalorieData);
    } catch (error) {
      console.error('Load dashboard data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockCalorieData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const targetCalories = 2000;
    
    return days.map((day, index) => ({
      day,
      actual: Math.floor(Math.random() * 500) + 1500, // Random between 1500-2000
      target: targetCalories,
      date: new Date(Date.now() - (6 - index) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));
  };

  const processWeightData = (weightLogs) => {
    // Get last 7 days of weight data
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const weightLog = weightLogs.find(log => 
        new Date(log.date).toISOString().split('T')[0] === dateStr
      );
      
      last7Days.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        weight: weightLog ? weightLog.weight : null,
        date: dateStr
      });
    }
    
    setWeightData(last7Days);
  };

  const renderWeightChart = () => {
    const chartData = weightData
      .filter(item => item.weight !== null)
      .map(item => ({
        x: item.day,
        y: item.weight,
        label: `${item.weight} kg`
      }));

    if (chartData.length === 0) {
      return (
        <View style={styles.emptyChart}>
          <Ionicons name="trending-up" size={48} color={theme.colors.text + '40'} />
          <Text style={[styles.emptyChartText, { color: theme.colors.text + '60' }]}>
            No weight data available
          </Text>
          <TouchableOpacity
            style={[styles.addDataButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('WeightLog')}
          >
            <Text style={styles.addDataButtonText}>Add Weight Log</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <VictoryChart
        width={width - 40}
        height={200}
        theme={VictoryTheme.material}
        domainPadding={20}
      >
        <VictoryAxis
          style={{
            axis: { stroke: theme.colors.text + '40' },
            tickLabels: { fill: theme.colors.text, fontSize: 12 }
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: theme.colors.text + '40' },
            tickLabels: { fill: theme.colors.text, fontSize: 12 }
          }}
          label="Weight (kg)"
          style={{
            axisLabel: { fill: theme.colors.text, fontSize: 12, padding: 30 }
          }}
        />
        <VictoryLine
          data={chartData}
          style={{
            data: { stroke: theme.colors.primary, strokeWidth: 3 }
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 }
          }}
        />
        <VictoryTooltip
          style={{ fill: theme.colors.text }}
          flyoutStyle={{
            stroke: theme.colors.primary,
            fill: theme.colors.card
          }}
        />
      </VictoryChart>
    );
  };

  const renderCalorieChart = () => {
    const chartData = calorieData.map(item => ({
      x: item.day,
      y: item.actual,
      target: item.target,
      label: `${item.actual} cal`
    }));

    return (
      <VictoryChart
        width={width - 40}
        height={200}
        theme={VictoryTheme.material}
        domainPadding={20}
      >
        <VictoryAxis
          style={{
            axis: { stroke: theme.colors.text + '40' },
            tickLabels: { fill: theme.colors.text, fontSize: 12 }
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: theme.colors.text + '40' },
            tickLabels: { fill: theme.colors.text, fontSize: 12 }
          }}
          label="Calories"
          style={{
            axisLabel: { fill: theme.colors.text, fontSize: 12, padding: 30 }
          }}
        />
        <VictoryBar
          data={chartData}
          style={{
            data: { fill: theme.colors.primary, opacity: 0.8 }
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 }
          }}
        />
        <VictoryLine
          data={chartData}
          y="target"
          style={{
            data: { stroke: '#FF5252', strokeWidth: 2, strokeDasharray: '5,5' }
          }}
          label="Target"
        />
        <VictoryTooltip
          style={{ fill: theme.colors.text }}
          flyoutStyle={{
            stroke: theme.colors.primary,
            fill: theme.colors.card
          }}
        />
      </VictoryChart>
    );
  };

  const renderQuickActions = () => (
    <View style={styles.quickActions}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('NutritionSearch')}
        >
          <Ionicons name="search" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Nutrition Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('Reminders')}
        >
          <Ionicons name="notifications" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Reminders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('MealSuggestions')}
        >
          <Ionicons name="restaurant" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Meal Ideas</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: theme.colors.card }]}
          onPress={() => navigation.navigate('WeightLog')}
        >
          <Ionicons name="scale" size={24} color={theme.colors.primary} />
          <Text style={[styles.actionText, { color: theme.colors.text }]}>Log Weight</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Dashboard</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text + '80' }]}>
            Track your progress and stay motivated
          </Text>
        </View>

        {renderQuickActions()}

        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weight Progress</Text>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: theme.colors.card }]}
              onPress={loadDashboardData}
            >
              <Ionicons name="refresh" size={16} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
            {renderWeightChart()}
          </View>
        </View>

        <View style={styles.chartSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Weekly Calorie Intake</Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}>
            {renderCalorieChart()}
          </View>
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: theme.colors.primary }]} />
              <Text style={[styles.legendText, { color: theme.colors.text }]}>Actual</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF5252' }]} />
              <Text style={[styles.legendText, { color: theme.colors.text }]}>Target</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyChart: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  addDataButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addDataButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 14,
  },
});

export default DashboardScreen; 