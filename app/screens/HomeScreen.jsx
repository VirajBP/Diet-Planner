import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
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
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealsContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const { width } = Dimensions.get('window');

const MOTIVATIONAL_QUOTES = [
  "Stay hydrated! 💧",
  "You're doing great! 🌟",
  "Small steps lead to big changes! 🚶‍♂️",
  "Keep going, you've got this! 💪",
  "Every meal choice matters! 🥗",
  "Progress over perfection! 📈",
];

// Fresh & Calm (Mint Theme)
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

const HomeScreen = () => {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const { user } = useAuth();
  const { meals, loading: mealsLoading, loadMeals, addMeal: addMealToContext, deleteMeal: deleteMealFromContext } = useMeals();
  const [modalVisible, setModalVisible] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    quantity: '',
    unit: 'plate',
    type: 'breakfast',
  });
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [profile, setProfile] = useState(null);
  const [quote, setQuote] = useState('');
  const [todayWater, setTodayWater] = useState(0);
  const [todayCalories, setTodayCalories] = useState(0);
  const [todaysMeals, setTodaysMeals] = useState([]);
  const navigation = useNavigation();
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allowedUnits, setAllowedUnits] = useState(null);

  const mealTypes = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch', value: 'lunch' },
    { label: 'Dinner', value: 'dinner' },
    { label: 'Snack', value: 'snack' }
  ];

  const renderPremiumFeature = (title, icon) => {
    if(!user?.isPremium){
      return(
    <TouchableOpacity
      style={[styles.premiumFeature, { backgroundColor: customColors.card }]}
      onPress={() => Alert.alert('Premium Feature', 'Upgrade to premium to access this feature!')}
    >
      <Ionicons name={icon} size={24} color={customColors.primary} />
      <Text style={[styles.premiumText, { color: customColors.text }]}>{title}</Text>
    </TouchableOpacity>);
    }
    return null
};

  useEffect(() => {
    loadData();
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await loadMeals();
      setProfile(user?.profile);
      
      // Calculate streak
      const streakCount = calculateStreak(meals || []);
      setStreak(streakCount);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load some data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (meals) => {
    if (!meals || meals.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasMeals = meals.some(meal => meal.date === dateStr);
      
      if (!hasMeals) break;
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Recalculate todaysMeals and calories when meals change
  useEffect(() => {
    if (meals) {
      const todayStr = new Date().toISOString().split('T')[0];
      const filteredMeals = meals.filter(meal => new Date(meal.date).toISOString().split('T')[0] === todayStr);
      setTodaysMeals(filteredMeals);
      const totalCals = filteredMeals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
      setTodayCalories(totalCals);
    }
  }, [meals]);

  const UNIT_CALORIES = {
    'plate': 350,
    'bowl': 250,
    'half bowl': 125,
    'cup': 150,
    'glass': 100,
    'piece': 80,
    'serving': 200,
    'slice': 90,
    'spoon': 40,
  };
  const UNIT_OPTIONS = [
    { label: 'Plate', value: 'plate' },
    { label: 'Bowl', value: 'bowl' },
    { label: 'Half Bowl', value: 'half bowl' },
    { label: 'Cup', value: 'cup' },
    { label: 'Glass', value: 'glass' },
    { label: 'Piece', value: 'piece' },
    { label: 'Serving', value: 'serving' },
    { label: 'Slice', value: 'slice' },
    { label: 'Spoon', value: 'spoon' },
  ];

  const parseQuantityToCalories = (quantity, unit, suggestion) => {
    if (!quantity || !unit) return 0;
    let amount = parseFloat(quantity);
    if (isNaN(amount)) return 0;
    let caloriesPerUnit = UNIT_CALORIES[unit] || 0;
    if (suggestion && suggestion.units) {
      const unitObj = suggestion.units.find(u => u.unit === unit);
      if (unitObj) caloriesPerUnit = unitObj.calories;
    }
    return Math.round(amount * caloriesPerUnit);
  };

  // Fetch meal suggestions as user types
  const fetchMealSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setMealSuggestions([]);
      setShowSuggestions(false);
      setAllowedUnits(null);
      return;
    }
    try {
      const suggestions = await mongodbService.getMealSuggestions();
      // Filter suggestions by query
      const filtered = suggestions.filter(m => m.name.toLowerCase().includes(query.toLowerCase()));
      setMealSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } catch (e) {
      setMealSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // When user selects a suggestion
  const handleSuggestionSelect = (suggestion) => {
    setNewMeal({ ...newMeal, name: suggestion.name });
    setAllowedUnits(suggestion.units.map(u => u.unit));
    setShowSuggestions(false);
    // If current unit is not allowed, reset to first allowed
    if (!suggestion.units.some(u => u.unit === newMeal.unit)) {
      setNewMeal(prev => ({ ...prev, unit: suggestion.units[0]?.unit || 'plate' }));
    }
  };

  const addMeal = async () => {
    if (!newMeal.name || !newMeal.quantity || !newMeal.unit || !newMeal.type) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (allowedUnits && !allowedUnits.includes(newMeal.unit)) {
      Alert.alert('Invalid Unit', `You cannot log ${newMeal.name} in ${newMeal.unit} unit. Allowed units: ${allowedUnits.join(', ')}`);
      return;
    }
    // Find the selected suggestion if available
    const selectedSuggestion = mealSuggestions.find(s => s.name === newMeal.name);
    try {
      setLoading(true);
      const calories = parseQuantityToCalories(newMeal.quantity, newMeal.unit, selectedSuggestion);
      
      // Calculate macronutrients based on selected suggestion or use default ratios
      let protein = 0, carbs = 0, fat = 0;
      if (selectedSuggestion && selectedSuggestion.units) {
        const unitObj = selectedSuggestion.units.find(u => u.unit === newMeal.unit);
        if (unitObj) {
          const quantity = parseFloat(newMeal.quantity);
          protein = Math.round((unitObj.protein || 0) * quantity);
          carbs = Math.round((unitObj.carbs || 0) * quantity);
          fat = Math.round((unitObj.fat || 0) * quantity);
        }
      } else {
        // Default macronutrient ratios if no suggestion is selected
        // 20% protein, 50% carbs, 30% fat (typical balanced meal)
        protein = Math.round(calories * 0.2 / 4); // 4 calories per gram of protein
        carbs = Math.round(calories * 0.5 / 4);   // 4 calories per gram of carbs
        fat = Math.round(calories * 0.3 / 9);     // 9 calories per gram of fat
      }
      
      const mealData = {
        name: newMeal.name,
        calories,
        type: newMeal.type,
        quantity: `${newMeal.quantity} ${newMeal.unit}`,
        protein,
        carbs,
        fat,
        ingredients: selectedSuggestion?.ingredients || []
      };
      await addMealToContext(mealData);
      setNewMeal({ name: '', quantity: '', unit: 'plate', type: 'breakfast' });
      setAllowedUnits(null);
      setShowSuggestions(false);
      setMealSuggestions([]);
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeal = async (mealId) => {
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
              await deleteMealFromContext(mealId);
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

  // Helper to calculate BMR and calorie goals (match CalorieCalculatorScreen)
  function getCalorieGoals(profile) {
    if (!profile || !profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel) {
      return { maintain: 2000, lose: 1500, gain: 2500 };
    }
    let bmr;
    if (profile.gender.toLowerCase() === 'male') {
      bmr = 88.362 + (13.397 * parseFloat(profile.weight)) + (4.799 * parseFloat(profile.height)) - (5.677 * parseFloat(profile.age));
    } else {
      bmr = 447.593 + (9.247 * parseFloat(profile.weight)) + (3.098 * parseFloat(profile.height)) - (4.330 * parseFloat(profile.age));
    }
    let activityMultiplier;
    switch ((profile.activityLevel || '').toLowerCase()) {
      case 'sedentary': activityMultiplier = 1.2; break;
      case 'light': activityMultiplier = 1.375; break;
      case 'moderate': activityMultiplier = 1.55; break;
      case 'active': activityMultiplier = 1.725; break;
      case 'veryactive': activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.375;
    }
    const maintain = Math.round(bmr * activityMultiplier);
    const lose = Math.round(maintain - 500);
    const gain = Math.round(maintain + 500);
    return { maintain, lose, gain };
  }

  // Use accurate daily calorie calculation for 'lose' goal
  const calorieGoals = getCalorieGoals(profile);
  const goalCalories = calorieGoals.lose;
  const remainingCalories = goalCalories - todayCalories;
  const progress = Math.min(todayCalories / goalCalories, 1);

  if (loading && !profile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.greeting, { color: customColors.text }]}>
            Hello, {profile?.name || 'there'}!
          </Text>
          <Text style={[styles.motivationalText, { color: customColors.text }]}>
            {quote}
          </Text>
        </View>

        

        <Card style={[styles.calorieCard, {backgroundColor: customColors.background} ]}>
          <ProgressCircle
            size={120}
            progress={progress}
            strokeWidth={12}
            progressColor={customColors.primary}
            backgroundColor={customColors.border}
          >
            <View style={styles.calorieCircleContent}>
              <Text style={[styles.calorieNumber, { color: customColors.text }]}>{todayCalories}</Text>
              <Text style={[styles.calorieLabel, { color: customColors.text }]}>consumed</Text>
            </View>
          </ProgressCircle>
          <View style={styles.calorieInfo}>
            <Text style={[styles.goalText, { color: customColors.text }]}>Goal: {goalCalories}</Text>
            {(!profile || goalCalories === 1500) && (
              <Text style={[styles.remainingText, { color: customColors.error, fontSize: 13 }]}>Set up your profile or use the Calorie Calculator for a personalized goal.</Text>
            )}
          </View>
        </Card>

        <Card style={[styles.mealsCard, {backgroundColor: customColors.background}]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: customColors.text }]}>Today's Meals</Text>
            <TouchableOpacity
              style={[styles.addMealButton, { backgroundColor: customColors.primary }]}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="add" size={24} color="white" />
              <Text style={styles.addMealButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </View>
          {!todaysMeals ? (
            <ActivityIndicator size="large" color={customColors.primary} />
          ) : todaysMeals.length === 0 ? (
            <Text style={[styles.emptyText, { color: customColors.text }]}>No meals logged today</Text>
          ) : (
            todaysMeals.map((meal, index) => (
              <View key={meal._id || index} style={[styles.mealItem,{borderBottomColor:customColors.border}]}>
                <View>
                  <Text style={[styles.mealName, { color: customColors.text }]}>{meal.name || 'Unnamed Meal'}</Text>
                  <Text style={[styles.mealType, { color: customColors.text }]}>{meal.type ? meal.type.charAt(0).toUpperCase() + meal.type.slice(1) : 'Other'}</Text>
                </View>
                <View style={styles.mealRight}>
                  <Text style={[styles.mealCalories, { color: customColors.text }]}>{meal.calories || 0} cal</Text>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteMeal(meal._id)}>
                    <Ionicons name="trash-outline" size={20} color={customColors.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </Card>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={[styles.modalContent, { backgroundColor: customColors.card }]}>
              <Text style={[styles.modalTitle, { color: customColors.text }]}>Add New Meal</Text>
              
              <TextInput
                style={[styles.input, { backgroundColor: customColors.background, color: customColors.text, borderColor: customColors.border }]}
                placeholder="Meal Name"
                placeholderTextColor="#8E8E93"
                value={newMeal.name}
                onChangeText={text => {
                  setNewMeal({ ...newMeal, name: text });
                  fetchMealSuggestions(text);
                  setAllowedUnits(null); // Reset allowed units until suggestion is picked
                }}
                autoCorrect={false}
              />
              
              {showSuggestions && (
                <View style={{ backgroundColor: customColors.card, borderRadius: 8, maxHeight: 120, marginBottom: 8 }}>
                  {mealSuggestions.map(suggestion => (
                    <TouchableOpacity
                      key={suggestion.id}
                      style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: customColors.border }}
                      onPress={() => handleSuggestionSelect(suggestion)}
                    >
                      <Text style={{ color: customColors.text }}>{suggestion.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              
              <TextInput
                style={[styles.input, { backgroundColor: customColors.background, color: customColors.text, borderColor: customColors.border }]}
                placeholder="Quantity"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={newMeal.quantity}
                onChangeText={(text) => setNewMeal({ ...newMeal, quantity: text })}
              />

              <Picker
                label="Unit"
                selectedValue={newMeal.unit}
                onValueChange={(value) => setNewMeal({ ...newMeal, unit: value })}
                options={(allowedUnits ? UNIT_OPTIONS.filter(opt => allowedUnits.includes(opt.value)) : UNIT_OPTIONS)}
                placeholder="Select Unit"
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
                  style={[styles.modalButton, styles.cancelButton, { backgroundColor: customColors.background }]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: customColors.text }]}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, { backgroundColor: customColors.primary }]}
                  onPress={addMeal}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: customColors.primary }]}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Ionicons name="person" size={24} color="white" />
            <Text style={styles.actionButtonText}>Chatbot</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: customColors.primary }]}
            onPress={() => navigation.navigate('Meals')}
          >
            <Ionicons name="restaurant" size={24} color="white" />
            <Text style={styles.actionButtonText}>Meal Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: customColors.primary, paddingLeft:25 }]}
            onPress={() => navigation.navigate('CalorieCalculator')}
          >
            <Ionicons name="scale" size={24} color="white" />
            <Text style={styles.actionButtonText}>Calorie Check</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Features Preview */}
        <View style={styles.premiumContainer}>
          <Text style={[styles.sectionTitle, { color: customColors.text }]}>Premium Features</Text>
          <View style={styles.premiumFeaturesContainer}>
          {/* <ScrollView horizontal showsHorizontalScrollIndicator={false} > */}
              <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: customColors.card }]}
              onPress={() => navigation.navigate('WeightLog')}
            >
              <Ionicons name="scale" size={24} color={customColors.primary} />
              <Text style={[styles.actionText, { color: customColors.text }]}>Log Weight</Text>
            </TouchableOpacity>
                <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: customColors.card }]}
              onPress={() => navigation.navigate('Water')}
            >
              <Ionicons name="water" size={24} color={customColors.primary} />
              <Text style={[styles.actionText, { color: customColors.text }]}>Water Tracker</Text>
            </TouchableOpacity>
                <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: customColors.card }]}
              onPress={() => navigation.navigate('MealSuggestions')}
            >
              <Ionicons name="bulb-outline" size={24} color={customColors.primary} />
              <Text style={[styles.actionText, { color: customColors.text }]}>Custom Ingredients Meal Search</Text>
            </TouchableOpacity>
            
                <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: customColors.card }]}
              onPress={() => navigation.navigate('ProgressStatistics')}
            >
              <Ionicons name="bar-chart-outline" size={24} color={customColors.primary} />
              <Text style={[styles.actionText, { color: customColors.text }]}>Progress Statistics</Text>
            </TouchableOpacity>
                
          {/* </ScrollView> */}
          </View>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 24,
  },
  actionCard: {
    width: '48%',
    height: 100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 16,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  premiumFeaturesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    marginBottom: 40,
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
  addMealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMealButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
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
    marginBottom: 20,
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
  premiumFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginRight: 12,
    minWidth: 200,
  },
});

export default HomeScreen; 