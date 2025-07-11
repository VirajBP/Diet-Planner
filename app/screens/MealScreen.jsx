import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '../components/ui/Picker';
import { useAuth } from '../context/AuthContext';
import { useMeals } from '../context/MealsContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

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

const MealScreen = () => {
  const { theme, isDark } = useTheme();
  const { meals, loading: mealsLoading, loadMeals, addMeal: addMealToContext, deleteMeal: deleteMealFromContext } = useMeals();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupedMeals, setGroupedMeals] = useState([]);
  const [newMeal, setNewMeal] = useState({
    name: '',
    quantity: '',
    unit: 'plate',
    type: 'breakfast',
  });
  const [mealSuggestions, setMealSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allowedUnits, setAllowedUnits] = useState(null);
  const navigation = useNavigation();
  const { user } = useAuth();

  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

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

  const mealTypes = [
    { label: 'Breakfast', value: 'breakfast' },
    { label: 'Lunch', value: 'lunch' },
    { label: 'Dinner', value: 'dinner' },
    { label: 'Snack', value: 'snack' }
  ];

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: customColors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: customColors.border,
      backgroundColor: customColors.card,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
      color: customColors.text,
    },
    headerButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    suggestionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      backgroundColor: customColors.primary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      backgroundColor: customColors.primary,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: customColors.background,
    },
    loadingText: {
      fontSize: 16,
      marginTop: 8,
      color: customColors.text,
    },
    mealsList: {
      padding: 16,
    },
    dateGroup: {
      marginBottom: 24,
    },
    dateHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
      color: customColors.text,
      paddingHorizontal: 16,
    },
    mealCard: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      backgroundColor: customColors.card,
    },
    mealHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    mealName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: customColors.text,
      flex: 1,
    },
    mealType: {
      fontSize: 14,
      marginTop: 4,
      opacity: 0.8,
      color: customColors.text,
      textTransform: 'capitalize',
    },
    mealCalories: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 4,
      color: customColors.primary,
    },
    mealIngredients: {
      fontSize: 14,
      marginTop: 8,
      fontStyle: 'italic',
      color: customColors.text + '80',
    },
    deleteButton: {
      padding: 8,
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      width: '90%',
      borderRadius: 20,
      padding: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 16,
      marginBottom: 8,
    },
    input: {
      height: 50,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    picker: {
      flexDirection: 'row',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 16,
    },
    pickerOption: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },
    selectedOption: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
    },
    pickerText: {
      fontSize: 14,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: '#E0E0E0',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 48,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: 'bold',
      marginTop: 16,
    },
    emptySubText: {
      fontSize: 14,
      marginTop: 8,
      fontStyle: 'italic',
      opacity: 0.7,
    },
    suggestionsContainer: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    suggestionCard: {
      width: 250,
      padding: 16,
      borderRadius: 12,
      marginRight: 12,
    },
    suggestionName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    suggestionCalories: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    suggestionIngredients: {
      fontSize: 12,
      fontStyle: 'italic',
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      right: 16,
      padding: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '500',
    },
    saveButton: {
      backgroundColor: customColors.primary,
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '500',
    },
  };

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  // Group meals by date for the last 7 days
  useEffect(() => {
    if (meals) {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      // Filter meals for the last 7 days
      const recentMeals = meals.filter(meal => {
        const mealDate = new Date(meal.date);
        return mealDate >= sevenDaysAgo && mealDate <= today;
      });
      // Group meals by formatted date string
      const grouped = recentMeals.reduce((acc, meal) => {
        const dateStr = new Date(meal.date).toISOString().split('T')[0];
        if (!acc[dateStr]) {
          acc[dateStr] = {
            date: dateStr,
            meals: [],
            totalCalories: 0
          };
        }
        acc[dateStr].meals.push(meal);
        acc[dateStr].totalCalories += meal.calories || 0;
        return acc;
      }, {});
      // Convert to array and sort by date (newest first)
      const sortedGroupedMeals = Object.values(grouped).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setGroupedMeals(sortedGroupedMeals);
    }
  }, [meals]);

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
      const mealData = {
        name: newMeal.name,
        calories,
        type: newMeal.type,
        quantity: `${newMeal.quantity} ${newMeal.unit}`,
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
    try {
      setLoading(true);
      await deleteMealFromContext(mealId);
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMealSuggestions = async () => {
    try {
      setLoading(true);
      const response = await mongodbService.getMealSuggestions();
      setMealSuggestions(response);
    } catch (error) {
      console.error('Error loading meal suggestions:', error);
      Alert.alert('Error', 'Failed to load meal suggestions');
    } finally {
      setLoading(false);
    }
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

  const renderDateGroup = ({ item }) => (
    <View style={dynamicStyles.dateGroup}>
      <View style={dynamicStyles.dateHeader}>
        <Text style={[dynamicStyles.dateHeader, { color: customColors.text }]}>
          {formatDate(item.date)} - {item.totalCalories} cal
        </Text>
      </View>
      {item.meals.map((meal, index) => (
        <View key={`${meal._id || meal.name || index}-${meal.date}`} style={[dynamicStyles.mealCard, { backgroundColor: customColors.card }]}>
          <View style={dynamicStyles.mealHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[dynamicStyles.mealName, { color: customColors.text }]}>{meal.name || 'Unnamed Meal'}</Text>
              <Text style={[dynamicStyles.mealType, { color: customColors.text }]}>
                {meal.type ? meal.type.charAt(0).toUpperCase() + meal.type.slice(1) : 'Other'}
              </Text>
            </View>
            <TouchableOpacity
              style={dynamicStyles.deleteButton}
              onPress={() => {
                Alert.alert(
                  'Delete Meal',
                  'Are you sure you want to delete this meal?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteMeal(meal._id)
                    }
                  ]
                );
              }}
            >
              <Ionicons name="trash-outline" size={20} color={customColors.error} />
            </TouchableOpacity>
          </View>
          <Text style={[dynamicStyles.mealCalories, { color: customColors.primary }]}>
            {meal.calories || 0} cal
          </Text>
          {meal.ingredients && meal.ingredients.length > 0 && (
            <Text style={[dynamicStyles.mealIngredients, { color: customColors.text + '80' }]}>
              {Array.isArray(meal.ingredients) ? meal.ingredients.join(', ') : meal.ingredients}
            </Text>
          )}
        </View>
      ))}
    </View>
  );

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderAddMealModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[dynamicStyles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[dynamicStyles.modalContent, { backgroundColor: customColors.card }]}>
          <Text style={[dynamicStyles.modalTitle, { color: customColors.text }]}>Add New Meal</Text>
          
          <TextInput
            style={[dynamicStyles.input, { backgroundColor: customColors.background, color: customColors.text, borderColor: customColors.border }]}
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
            style={[dynamicStyles.input, { backgroundColor: customColors.background, color: customColors.text, borderColor: customColors.border }]}
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
          
          <View style={dynamicStyles.modalButtons}>
            <TouchableOpacity
              style={[dynamicStyles.modalButton, dynamicStyles.cancelButton, { backgroundColor: customColors.background }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[dynamicStyles.cancelButtonText, { color: customColors.text }]}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[dynamicStyles.modalButton, dynamicStyles.saveButton, { backgroundColor: customColors.primary }]}
              onPress={addMeal}
            >
              <Text style={dynamicStyles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading && !meals) {
    return (
      <SafeAreaView style={[dynamicStyles.container, { backgroundColor: customColors.background }]}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={[dynamicStyles.title, { color: customColors.text }]}>My Meals</Text>
        <View style={dynamicStyles.headerButtons}>
          <TouchableOpacity
            style={[dynamicStyles.suggestionButton, { backgroundColor: customColors.primary }]}
            onPress={() => navigation.navigate('MealSuggestions')}
          >
            <Ionicons name="bulb-outline" size={20} color="white" />
            <Text style={dynamicStyles.buttonText}>Suggestions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.addButton, { backgroundColor: customColors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={dynamicStyles.buttonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
      </View>
      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <Text style={[dynamicStyles.loadingText, { color: customColors.text }]}>Loading meals...</Text>
        </View>
      ) : (
        <FlatList
          data={groupedMeals}
          keyExtractor={(item, index) => `date-group-${item.date}-${index}`}
          renderItem={renderDateGroup}
          contentContainerStyle={dynamicStyles.mealsList}
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons 
                name="restaurant-outline" 
                size={64} 
                color={customColors.text + '40'} 
              />
              <Text style={[dynamicStyles.emptyText, { color: customColors.text }]}>No meals recorded yet</Text>
              <Text style={[dynamicStyles.emptySubText, { color: customColors.text + '80' }]}>Tap the Add Meal button to get started</Text>
            </View>
          }
        />
      )}
      {renderAddMealModal()}
    </SafeAreaView>
  );
};


export default MealScreen; 