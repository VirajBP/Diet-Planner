import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/Card';
import { Picker } from '../components/ui/Picker';
import ProgressCircle from '../components/ui/ProgressCircle';
import { useTheme } from '../context/ThemeContext';
import MongoDBService, { mongodbService } from '../services/mongodb.service';

const MOTIVATIONAL_QUOTES = [
  "Stay hydrated! 💧",
  "You're doing great! 🌟",
  "Small steps lead to big changes! 🚶‍♂️",
  "Keep going, you've got this! 💪",
  "Every meal choice matters! 🥗",
  "Progress over perfection! 📈",
];

const HomeScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', type: 'Snack' });
  const [meals, setMeals] = useState([]);
  const [profile, setProfile] = useState(null);
  const [goalCalories, setGoalCalories] = useState(0);
  const [streak, setStreak] = useState(0);
  const [quote, setQuote] = useState('');
  const [todayWater, setTodayWater] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);

  const mealTypes = [
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Snack', value: 'Snack' }
  ];

  const renderPremiumFeature = (title, icon) => (
    <TouchableOpacity
      style={[styles.premiumFeature, { backgroundColor: theme.colors.card }]}
      onPress={() => Alert.alert('Premium Feature', 'Upgrade to premium to access this feature!')}
    >
      <Ionicons name={icon} size={24} color={theme.colors.primary} />
      <Text style={[styles.premiumText, { color: theme.colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    loadData();
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load user profile
      const userData = await mongodbService.getProfile();
      setProfile(userData.profile);
      
      // Calculate daily calorie goal using static method
      const dailyGoal = MongoDBService.calculateDailyCalories(userData.profile);
      setGoalCalories(dailyGoal);

      // Load today's meals
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const mealsData = await mongodbService.getMeals();
      const todaysMeals = mealsData.filter(meal => {
        const mealDate = new Date(meal.createdAt);
        mealDate.setHours(0, 0, 0, 0);
        return mealDate.getTime() === today.getTime();
      });
      setMeals(todaysMeals);

      // Calculate today's total calories
      const totalCalories = todaysMeals.reduce((sum, meal) => sum + (parseInt(meal.calories) || 0), 0);
      setTodayCalories(totalCalories);

      // Load water logs (handle premium feature gracefully)
      try {
        const waterLogs = await mongodbService.getWaterLogs();
        const todayWaterLogs = waterLogs.filter(log => {
          const logDate = new Date(log.createdAt);
          logDate.setHours(0, 0, 0, 0);
          return logDate.getTime() === today.getTime();
        });
        const totalWater = todayWaterLogs.reduce((sum, log) => sum + (log.amount || 0), 0);
        setTodayWater(totalWater);
      } catch (error) {
        if (error.message?.includes('premium')) {
          console.log('Water tracking is a premium feature');
        } else {
          console.error('Error loading water logs:', error);
        }
        setTodayWater(0);
      }

      // Calculate streak
      let streakCount = 0;
      let currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      while (true) {
        const dayMeals = mealsData.filter(meal => {
          const mealDate = new Date(meal.createdAt);
          mealDate.setHours(0, 0, 0, 0);
          return mealDate.getTime() === currentDate.getTime();
        });

        if (dayMeals.length === 0) break;
        streakCount++;
        currentDate.setDate(currentDate.getDate() - 1);
      }
      setStreak(streakCount);

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async () => {
    if (!newMeal.name || !newMeal.calories || !newMeal.type) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const mealData = {
        name: newMeal.name,
        calories: parseInt(newMeal.calories),
        type: newMeal.type,
      };

      const createdMeal = await mongodbService.createMeal(mealData);
      setMeals([...meals, createdMeal]);
      setNewMeal({ name: '', calories: '', type: 'Snack' });
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId, index) => {
    Alert.alert(
      "Delete Meal",
      "Are you sure you want to delete this meal?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await mongodbService.deleteMeal(mealId);
              const newMeals = [...meals];
              newMeals.splice(index, 1);
              setMeals(newMeals);
            } catch (error) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const remainingCalories = goalCalories - totalCalories;
  const progress = Math.min(totalCalories / goalCalories, 1);

  if (loading && !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.colors.text }]}>
          Hello, {profile?.name || 'there'}!
        </Text>
        <Text style={[styles.motivationalText, { color: theme.colors.text }]}>
          {quote}
        </Text>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Water')}
        >
          <Ionicons name="water" size={24} color="white" />
          <Text style={styles.actionButtonText}>Log Water</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Meals')}
        >
          <Ionicons name="restaurant" size={24} color="white" />
          <Text style={styles.actionButtonText}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('WeightLog')}
        >
          <Ionicons name="scale" size={24} color="white" />
          <Text style={styles.actionButtonText}>Log Weight</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Features Preview */}
      <View style={styles.premiumContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Premium Features
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderPremiumFeature('Custom Meal Plans', 'restaurant')}
          {renderPremiumFeature('Workout Library', 'fitness')}
          {renderPremiumFeature('Progress Analytics', 'analytics')}
          {renderPremiumFeature('Expert Consultation', 'people')}
        </ScrollView>
      </View>

      <Card style={styles.calorieCard}>
        <ProgressCircle
          size={120}
          progress={progress}
          strokeWidth={12}
          progressColor={theme.colors.primary}
          backgroundColor={theme.colors.border}
        >
          <View style={styles.calorieCircleContent}>
            <Text style={[styles.calorieNumber, { color: theme.colors.text }]}>{totalCalories}</Text>
            <Text style={[styles.calorieLabel, { color: theme.colors.text }]}>consumed</Text>
          </View>
        </ProgressCircle>
        <View style={styles.calorieInfo}>
          <Text style={[styles.goalText, { color: theme.colors.text }]}>Goal: {goalCalories}</Text>
          <Text style={[styles.remainingText, { color: theme.colors.text }]}>
            Remaining: {remainingCalories}
          </Text>
        </View>
      </Card>

      <Card style={styles.mealsCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Today's Meals</Text>
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {meals.map((meal, index) => (
          <View key={meal._id || index} style={styles.mealItem}>
            <View>
              <Text style={[styles.mealName, { color: theme.colors.text }]}>{meal.name}</Text>
              <Text style={[styles.mealType, { color: theme.colors.text }]}>{meal.type}</Text>
            </View>
            <View style={styles.mealRight}>
              <Text style={[styles.mealCalories, { color: theme.colors.primary }]}>
                {meal.calories} cal
              </Text>
              <TouchableOpacity
                onPress={() => deleteMeal(meal._id, index)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {meals.length === 0 && (
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No meals logged today. Tap + to add one!
          </Text>
        )}
      </Card>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Add Meal</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Add New Meal</Text>
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Meal Name"
              placeholderTextColor="#8E8E93"
              value={newMeal.name}
              onChangeText={(text) => setNewMeal({ ...newMeal, name: text })}
            />
            
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              placeholder="Calories"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
              value={newMeal.calories}
              onChangeText={(text) => setNewMeal({ ...newMeal, calories: text })}
            />

            <Picker
              label="Meal Type"
              selectedValue={newMeal.type}
              onValueChange={(value) => setNewMeal({ ...newMeal, type: value })}
              options={mealTypes}
              placeholder="Select Meal Type"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.background }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={addMeal}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
    marginTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  motivationalText: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 24,
    opacity: 0.8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    padding: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  premiumContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  calorieCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  calorieCircleContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
  },
  calorieInfo: {
    flex: 1,
    marginLeft: 20,
  },
  goalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  remainingText: {
    fontSize: 16,
  },
  mealsCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  mealType: {
    fontSize: 14,
    opacity: 0.7,
  },
  mealRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCalories: {
    fontSize: 16,
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    opacity: 0.7,
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  saveButton: {
    backgroundColor: '#FF9B71',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginRight: 12,
    minWidth: 200,
  },
  premiumText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HomeScreen; 