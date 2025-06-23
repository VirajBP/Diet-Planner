import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    LayoutAnimation,
    Platform,
    SectionList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView as SafeAreaViewRN } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ALLOWED_UNITS = ['plate', 'bowl', 'cup', 'piece', 'glass', 'spoon', 'slice', 'serving', 'ml'];
const EXCLUDED_TAGS = ['fat', 'spicy', 'oily'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Snacks', 'Dinner'];

const MealSuggestionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [unitSelections, setUnitSelections] = useState({});
  const [expanded, setExpanded] = useState({});
  const [recipeExpanded, setRecipeExpanded] = useState({});

  const currentWeight = user?.profile?.weight || user?.weight || 70;
  const targetWeight = user?.profile?.targetWeight || user?.targetWeight || 70;
  const isPremiumUser = user?.isPremium || false;
  const isOverweight = currentWeight - targetWeight > 5;

  const calculateAdjustedCalories = (baseCalories) => {
    const DEFAULT_REFERENCE_WEIGHT = 95;
    return Math.round(baseCalories * (targetWeight / DEFAULT_REFERENCE_WEIGHT));
  };

  const getDefaultCaloriesLimit = (user) => {
    return {
      Breakfast: 400,
      Lunch: 600,
      Snacks: 300,
      Dinner: 600,
    };
  };

  const getMealSuggestions = async () => {
    try {
      setLoading(true);
      let response = await mongodbService.getMealSuggestions(
        isPremiumUser ? customIngredients : null,
        currentWeight,
        targetWeight
      );
      if (isOverweight) {
        response = response.filter(meal => !meal.tags?.some(tag => EXCLUDED_TAGS.includes(tag)));
      }
      setSuggestions(response);
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      Alert.alert('Error', 'Failed to get meal suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMealSuggestions();
  }, [isOverweight]);

  const caloriesLimit = getDefaultCaloriesLimit(user);

  const handleUnitChange = (mealId, unit) => {
    setUnitSelections(prev => ({ ...prev, [mealId]: unit }));
  };

  const handleToggleExpand = (mealId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const handleToggleRecipe = (mealId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRecipeExpanded(prev => ({ ...prev, [mealId]: !prev[mealId] }));
  };

  const getRecommendedQuantity = (meal, selectedUnit, mealType) => {
    const unitObj = meal.units.find(u => u.unit === selectedUnit);
    if (!unitObj) return { qty: 1, totalCalories: unitObj?.calories || 0 };
    const limit = caloriesLimit[mealType] || 400;
    const qty = Math.round((limit / unitObj.calories) * 10) / 10;
    return { qty, totalCalories: Math.round(qty * unitObj.calories) };
  };

  const groupMeals = (meals) => {
    const sections = MEAL_TYPES.map(type => ({ title: type, data: [] }));
    meals.forEach((meal, idx) => {
      sections[idx % 4].data.push(meal);
    });
    return sections;
  };

  const renderNutritionInfo = (meal, selectedUnit) => {
    const unitObj = meal.units.find(u => u.unit === selectedUnit);
    if (!unitObj) return null;

    return (
      <View style={styles.nutritionContainer}>
        <Text style={[styles.nutritionTitle, { color: theme.colors.text }]}>Nutrition per {selectedUnit}</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionLabel, { color: theme.colors.text + '80' }]}>Calories</Text>
            <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{unitObj.calories}</Text>
          </View>
          {unitObj.protein && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.text + '80' }]}>Protein</Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{unitObj.protein}g</Text>
            </View>
          )}
          {unitObj.carbs && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.text + '80' }]}>Carbs</Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{unitObj.carbs}g</Text>
            </View>
          )}
          {unitObj.fat && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: theme.colors.text + '80' }]}>Fat</Text>
              <Text style={[styles.nutritionValue, { color: theme.colors.primary }]}>{unitObj.fat}g</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderRecipe = (meal) => {
    if (!meal.recipe || meal.recipe.length === 0) {
      return (
        <View style={styles.noRecipeContainer}>
          <Ionicons name="book-outline" size={24} color={theme.colors.text + '40'} />
          <Text style={[styles.noRecipeText, { color: theme.colors.text + '60' }]}>
            Recipe not available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recipeContainer}>
        <Text style={[styles.recipeTitle, { color: theme.colors.text }]}>Recipe Steps</Text>
        {meal.recipe.map((step, index) => (
          <View key={index} style={styles.recipeStep}>
            <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: theme.colors.text }]}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaViewRN style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading meal suggestions...
          </Text>
        </View>
      </SafeAreaViewRN>
    );
  }

  // Defensive: ensure suggestions is always an array
  const safeSuggestions = Array.isArray(suggestions) ? suggestions : [];
  const sections = groupMeals(safeSuggestions);

  return (
    <SafeAreaViewRN style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.sectionHeader, { color: theme.colors.text }]}>{title}</Text>
        )}
        renderItem={({ item, section }) => {
          const meal = item;
          const mealId = meal.id;
          const availableUnits = meal.units.filter(u => ALLOWED_UNITS.includes(u.unit));
          const selectedUnit = unitSelections[mealId] || (availableUnits[0]?.unit || 'plate');
          const { qty, totalCalories } = getRecommendedQuantity(meal, selectedUnit, section.title);
          return (
            <View style={[styles.mealCard, { backgroundColor: theme.colors.card }]}>
              {meal.imageUrl ? (
                <Image source={{ uri: meal.imageUrl }} style={styles.image} resizeMode="cover" />
              ) : (
                <View style={[styles.image, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="fast-food-outline" size={40} color="#bbb" />
                </View>
              )}
              <Text style={[styles.mealName, { color: theme.colors.text }]}>{meal.name}</Text>
              
              <View style={styles.tagsRow}>
                {meal.tags?.map(tag => (
                  <View key={tag} style={[styles.tag, { backgroundColor: theme.colors.primary + '33' }]}>
                    <Text style={[styles.tagText, { color: theme.colors.primary }]}>{tag}</Text>
                  </View>
                ))}
              </View>

              {/* Nutrition Information */}
              {renderNutritionInfo(meal, selectedUnit)}

              {/* Ingredients Section */}
              <TouchableOpacity onPress={() => handleToggleExpand(mealId)} style={styles.ingredientToggle}>
                <Text style={[styles.ingredientToggleText, { color: theme.colors.primary }]}>Ingredients</Text>
                <Ionicons name={expanded[mealId] ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              {expanded[mealId] && (
                <View style={styles.ingredientList}>
                  {meal.ingredients?.map((ing, idx) => (
                    <Text key={idx} style={[styles.ingredient, { color: theme.colors.text }]}>{ing}</Text>
                  ))}
                </View>
              )}

              {/* Recipe Section */}
              <TouchableOpacity onPress={() => handleToggleRecipe(mealId)} style={styles.recipeToggle}>
                <Text style={[styles.recipeToggleText, { color: theme.colors.primary }]}>Recipe</Text>
                <Ionicons name={recipeExpanded[mealId] ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.primary} />
              </TouchableOpacity>
              {recipeExpanded[mealId] && renderRecipe(meal)}

              <View style={styles.unitRow}>
                <Text style={[styles.unitLabel, { color: theme.colors.text }]}>Unit:</Text>
                <View style={styles.unitDropdown}>
                  {availableUnits.map(u => (
                    <TouchableOpacity
                      key={u.unit}
                      style={[styles.unitOption, selectedUnit === u.unit && styles.unitOptionSelected, selectedUnit === u.unit && { backgroundColor: theme.colors.primary }]}
                      onPress={() => handleUnitChange(mealId, u.unit)}
                    >
                      <Text style={[selectedUnit === u.unit ? styles.unitTextSelected : styles.unitText, { color: selectedUnit === u.unit ? '#fff' : theme.colors.text }]}>{u.unit}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Text style={[styles.recommendation, { color: theme.colors.text }]}>
                Recommended: Eat <Text style={[styles.bold, { color: theme.colors.primary }]}>{qty}</Text> {selectedUnit} — <Text style={[styles.bold, { color: theme.colors.primary }]}>{totalCalories}</Text> calories
              </Text>
            </View>
          );
        }}
        ListHeaderComponent={
          <>
            <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.heading, { color: theme.colors.text }]}>Meal Suggestions</Text>
            </View>
            {isPremiumUser && (
              <View style={[styles.premiumInputContainer, { backgroundColor: theme.colors.card }]}>
                <Text style={[styles.premiumLabel, { color: theme.colors.text }]}>Custom Ingredients (Premium)</Text>
                <TextInput
                  style={[styles.premiumInput, { color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={customIngredients}
                  onChangeText={setCustomIngredients}
                  placeholder="Enter ingredients you have..."
                  placeholderTextColor={theme.colors.text + '60'}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
                  onPress={getMealSuggestions}
                >
                  <Text style={styles.refreshButtonText}>Refresh Suggestions</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaViewRN>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  premiumInputContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  premiumLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  premiumInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  refreshButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    paddingBottom: 8,
  },
  mealCard: {
    margin: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  nutritionContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  nutritionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  ingredientToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientList: {
    marginBottom: 12,
  },
  ingredient: {
    fontSize: 14,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  recipeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  recipeToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipeContainer: {
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  recipeStep: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  noRecipeContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noRecipeText: {
    fontSize: 14,
    marginTop: 8,
  },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  unitLabel: {
    fontSize: 16,
    marginRight: 12,
  },
  unitDropdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  unitOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unitOptionSelected: {
    borderColor: '#2196F3',
  },
  unitText: {
    fontSize: 14,
  },
  unitTextSelected: {
    fontSize: 14,
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 16,
    textAlign: 'center',
    padding: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default MealSuggestionsScreen; 