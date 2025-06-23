import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMeals } from '../context/MealsContext';
import { useTheme } from '../context/ThemeContext';

const MealScreen = () => {
  const { theme } = useTheme();
  const { meals, loading: mealsLoading, loadMeals, addMeal: addMealToContext, deleteMeal: deleteMealFromContext } = useMeals();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newMeal, setNewMeal] = useState({
    type: 'breakfast',
    name: '',
    quantity: '',
    ingredients: '',
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const navigation = useNavigation();

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

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.card,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 16,
      color: theme.colors.text,
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
      backgroundColor: theme.colors.primary,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 8,
      backgroundColor: theme.colors.primary,
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
      backgroundColor: theme.colors.background,
    },
    loadingText: {
      fontSize: 16,
      marginTop: 8,
      color: theme.colors.text,
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
      color: theme.colors.text,
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
      backgroundColor: theme.colors.card,
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
      color: theme.colors.text,
      flex: 1,
    },
    mealType: {
      fontSize: 14,
      marginTop: 4,
      opacity: 0.8,
      color: theme.colors.text,
      textTransform: 'capitalize',
    },
    mealCalories: {
      fontSize: 16,
      fontWeight: '500',
      marginTop: 4,
      color: theme.colors.primary,
    },
    mealIngredients: {
      fontSize: 14,
      marginTop: 8,
      fontStyle: 'italic',
      color: theme.colors.text + '80',
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
    }
  };

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const parseQuantityToCalories = (quantity) => {
    if (!quantity) return 0;
    const match = quantity.match(/([\d.]+)\s*(\w+|half bowl|and half bowl)/i);
    if (!match) return 0;
    let amount = parseFloat(match[1]);
    let unit = match[2].toLowerCase();
    if (unit.includes('half')) {
      amount = 0.5;
      unit = 'bowl';
    }
    const caloriesPerUnit = UNIT_CALORIES[unit] || 0;
    return Math.round(amount * caloriesPerUnit);
  };

  const addMeal = async () => {
    if (!newMeal.name || !newMeal.quantity || !newMeal.type) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const calories = parseQuantityToCalories(newMeal.quantity);
      const mealData = {
        name: newMeal.name,
        calories,
        type: newMeal.type,
        quantity: newMeal.quantity,
        ingredients: newMeal.ingredients ? newMeal.ingredients.split(',').map(i => i.trim()) : []
      };

      await addMealToContext(mealData);
      setNewMeal({ name: '', quantity: '', type: 'breakfast', ingredients: '' });
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding meal:', error);
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
      setSuggestions(response);
    } catch (error) {
      console.error('Error loading meal suggestions:', error);
      Alert.alert('Error', 'Failed to load meal suggestions');
    } finally {
      setLoading(false);
    }
  };

  const renderMealItem = ({ item, index }) => (
    <View key={`${item._id || item.name || index}-${item.date}`} style={[dynamicStyles.mealCard, { backgroundColor: theme.colors.card }]}>
      <View style={dynamicStyles.mealHeader}>
        <Text style={[dynamicStyles.mealName, { color: theme.colors.text }]}>{item.name || 'Unnamed Meal'}</Text>
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
                  onPress: () => deleteMeal(item._id)
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
      <Text style={[dynamicStyles.mealType, { color: theme.colors.text }]}>
        {item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Other'}
      </Text>
      <Text style={[dynamicStyles.mealCalories, { color: theme.colors.primary }]}>
        {item.calories || 0} calories
      </Text>
      {item.ingredients && item.ingredients.length > 0 && (
        <Text style={[dynamicStyles.mealIngredients, { color: theme.colors.text + '80' }]}>
          {Array.isArray(item.ingredients) ? item.ingredients.join(', ') : item.ingredients}
        </Text>
      )}
    </View>
  );

  const renderAddMealModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[dynamicStyles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[dynamicStyles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[dynamicStyles.modalTitle, { color: theme.colors.text }]}>Add Meal</Text>
          
          <View style={dynamicStyles.inputContainer}>
            <Text style={[dynamicStyles.inputLabel, { color: theme.colors.text }]}>Type</Text>
            <View style={[dynamicStyles.picker, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity
                style={[
                  dynamicStyles.pickerOption,
                  newMeal.type === 'breakfast' && dynamicStyles.selectedOption,
                ]}
                onPress={() => setNewMeal({ ...newMeal, type: 'breakfast' })}
              >
                <Text style={[dynamicStyles.pickerText, { color: theme.colors.text }]}>Breakfast</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.pickerOption,
                  newMeal.type === 'lunch' && dynamicStyles.selectedOption,
                ]}
                onPress={() => setNewMeal({ ...newMeal, type: 'lunch' })}
              >
                <Text style={[dynamicStyles.pickerText, { color: theme.colors.text }]}>Lunch</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.pickerOption,
                  newMeal.type === 'dinner' && dynamicStyles.selectedOption,
                ]}
                onPress={() => setNewMeal({ ...newMeal, type: 'dinner' })}
              >
                <Text style={[dynamicStyles.pickerText, { color: theme.colors.text }]}>Dinner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.pickerOption,
                  newMeal.type === 'snack' && dynamicStyles.selectedOption,
                ]}
                onPress={() => setNewMeal({ ...newMeal, type: 'snack' })}
              >
                <Text style={[dynamicStyles.pickerText, { color: theme.colors.text }]}>Snack</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={[dynamicStyles.inputLabel, { color: theme.colors.text }]}>Name</Text>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={newMeal.name}
              onChangeText={(text) => setNewMeal({ ...newMeal, name: text })}
              placeholder="Enter meal name"
              placeholderTextColor={theme.colors.text}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={[dynamicStyles.inputLabel, { color: theme.colors.text }]}>Quantity (e.g., 1 plate, 1 bowl, 1.5 bowl)</Text>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={newMeal.quantity}
              onChangeText={(text) => setNewMeal({ ...newMeal, quantity: text })}
              placeholder="e.g., 1 plate, 1 bowl, 1.5 bowl"
              placeholderTextColor={theme.colors.text}
            />
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={[dynamicStyles.inputLabel, { color: theme.colors.text }]}>Ingredients (optional)</Text>
            <TextInput
              style={[dynamicStyles.input, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
              value={newMeal.ingredients}
              onChangeText={(text) => setNewMeal({ ...newMeal, ingredients: text })}
              placeholder="Enter ingredients (comma separated)"
              placeholderTextColor={theme.colors.text}
              multiline
            />
          </View>

          <View style={dynamicStyles.modalButtons}>
            <TouchableOpacity
              style={[dynamicStyles.modalButton, dynamicStyles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={dynamicStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dynamicStyles.modalButton, dynamicStyles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={addMeal}
            >
              <Text style={[dynamicStyles.buttonText, { color: '#FFFFFF' }]}>Add Meal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderMealSuggestions = (mealType) => {
    if (!suggestions || !suggestions[mealType]) return null;

    return (
      <View style={dynamicStyles.suggestionsContainer}>
        <Text style={[dynamicStyles.sectionTitle, { color: theme.colors.text }]}>
          Suggested {mealType.charAt(0).toUpperCase() + mealType.slice(1)} Options
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {suggestions[mealType].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[dynamicStyles.suggestionCard, { backgroundColor: theme.colors.card }]}
              onPress={() => {
                setNewMeal({
                  name: suggestion.name,
                  quantity: suggestion.quantity,
                  type: mealType.charAt(0).toUpperCase() + mealType.slice(1)
                });
                setModalVisible(true);
              }}
            >
              <Text style={[dynamicStyles.suggestionName, { color: theme.colors.text }]}>
                {suggestion.name}
              </Text>
              <Text style={[dynamicStyles.suggestionCalories, { color: theme.colors.primary }]}>
                {suggestion.calories} cal
              </Text>
              <Text style={[dynamicStyles.suggestionIngredients, { color: theme.colors.text + '80' }]}>
                {suggestion.ingredients.join(', ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading && !meals) {
    return (
      <SafeAreaView style={[dynamicStyles.container, { backgroundColor: theme.colors.background }]}>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={dynamicStyles.header}>
        <Text style={[dynamicStyles.title, { color: theme.colors.text }]}>My Meals</Text>
        <View style={dynamicStyles.headerButtons}>
          <TouchableOpacity
            style={[dynamicStyles.suggestionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.navigate('MealSuggestions')}
          >
            <Ionicons name="bulb-outline" size={20} color="white" />
            <Text style={dynamicStyles.buttonText}>Suggestions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[dynamicStyles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={dynamicStyles.buttonText}>Add Meal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={dynamicStyles.loadingContainer}>
          <Text style={[dynamicStyles.loadingText, { color: theme.colors.text }]}>Loading meals...</Text>
        </View>
      ) : (
        <FlatList
          data={meals}
          keyExtractor={(item, index) => `${item._id || item.name || index}-${item.date}`}
          renderItem={renderMealItem}
          contentContainerStyle={dynamicStyles.mealsList}
          ListEmptyComponent={
            <View style={dynamicStyles.emptyContainer}>
              <Ionicons 
                name="restaurant-outline" 
                size={64} 
                color={theme.colors.text + '40'} 
              />
              <Text style={[dynamicStyles.emptyText, { color: theme.colors.text }]}>
                No meals recorded yet
              </Text>
              <Text style={[dynamicStyles.emptySubText, { color: theme.colors.text + '80' }]}>
                Tap the Add Meal button to get started
              </Text>
            </View>
          }
        />
      )}

      {renderAddMealModal()}

      <Modal
        visible={showSuggestions}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSuggestions(false)}
      >
        <View style={[dynamicStyles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <View style={[dynamicStyles.modalContent, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={dynamicStyles.closeButton}
              onPress={() => setShowSuggestions(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[dynamicStyles.modalTitle, { color: theme.colors.text }]}>
              Meal Suggestions
            </Text>

            <TextInput
              style={[dynamicStyles.input, { 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={customIngredients}
              onChangeText={setCustomIngredients}
              placeholder="Enter ingredients (comma-separated)"
              placeholderTextColor={theme.colors.text}
            />

            <TouchableOpacity
              style={[dynamicStyles.submitButton, { backgroundColor: theme.colors.primary }]}
              onPress={loadMealSuggestions}
            >
              <Text style={dynamicStyles.submitButtonText}>Get Suggestions</Text>
            </TouchableOpacity>

            <ScrollView style={dynamicStyles.suggestionsList}>
              {renderMealSuggestions('breakfast')}
              {renderMealSuggestions('lunch')}
              {renderMealSuggestions('dinner')}
              {renderMealSuggestions('snack')}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


export default MealScreen; 