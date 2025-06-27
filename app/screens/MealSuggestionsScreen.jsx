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

const TOGGLE_OPTIONS = [
  { key: 'individual', label: 'Individual Meals' },
  { key: 'packages', label: 'Meal Packages' },
];

const MEAL_TYPE_OPTIONS = [
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

function calculatePackageTotalCalories(pkg) {
  if (!pkg || !pkg.meals) return 0;
  return pkg.meals.reduce((sum, entry) => sum + (entry.scaledCalories || entry.originalCalories || 0), 0);
}

const MealSuggestionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [unitSelections, setUnitSelections] = useState({});
  const [expanded, setExpanded] = useState({});
  const [recipeExpanded, setRecipeExpanded] = useState({});
  const [mealPackages, setMealPackages] = useState([]);
  const [toggle, setToggle] = useState('individual');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const isDark = theme.dark;
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

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
      let params = { mealType: selectedMealType };
      if (isPremiumUser && customIngredients) {
        params.ingredient = customIngredients;
      }
      // Use the new backend endpoint for predefined meals
      const { meals } = await mongodbService.getPredefinedMeals(params);
      let filteredMeals = meals;
      if (isOverweight) {
        filteredMeals = filteredMeals.filter(meal => !meal.tags?.some(tag => EXCLUDED_TAGS.includes(tag)));
      }
      setSuggestions(filteredMeals);
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      Alert.alert('Error', 'Failed to get meal suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendedMealPackages = async () => {
    try {
      setLoading(true);
      const response = await mongodbService.api.get('/mealPackages/recommend');
      setMealPackages(response.data);
    } catch (error) {
      console.error('Error fetching recommended meal packages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (toggle === 'individual') {
      getMealSuggestions();
    }
    // eslint-disable-next-line
  }, [toggle, selectedMealType, isOverweight]);

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
        <Text style={[styles.nutritionTitle, { color: customColors.text }]}>Nutrition per {selectedUnit}</Text>
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionLabel, { color: customColors.text + '80' }]}>Calories</Text>
            <Text style={[styles.nutritionValue, { color: customColors.primary }]}>{unitObj.calories}</Text>
          </View>
          {unitObj.protein && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: customColors.text + '80' }]}>Protein</Text>
              <Text style={[styles.nutritionValue, { color: customColors.primary }]}>{unitObj.protein}g</Text>
            </View>
          )}
          {unitObj.carbs && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: customColors.text + '80' }]}>Carbs</Text>
              <Text style={[styles.nutritionValue, { color: customColors.primary }]}>{unitObj.carbs}g</Text>
            </View>
          )}
          {unitObj.fat && (
            <View style={styles.nutritionItem}>
              <Text style={[styles.nutritionLabel, { color: customColors.text + '80' }]}>Fat</Text>
              <Text style={[styles.nutritionValue, { color: customColors.primary }]}>{unitObj.fat}g</Text>
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
          <Ionicons name="book-outline" size={24} color={customColors.text + '40'} />
          <Text style={[styles.noRecipeText, { color: customColors.text + '60' }]}>
            Recipe not available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.recipeContainer}>
        <Text style={[styles.recipeTitle, { color: customColors.text }]}>Recipe Steps</Text>
        {meal.recipe.map((step, index) => (
          <View key={index} style={styles.recipeStep}>
            <View style={[styles.stepNumber, { backgroundColor: customColors.primary }]}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: customColors.text }]}>{step}</Text>
          </View>
        ))}
      </View>
    );
  };

  // const renderMealPackage = (pkg, idx) => (
  //   <View key={pkg._id || idx} style={[styles.packageCard, { backgroundColor: customColors.card, borderColor: customColors.primary }]}> 
  //     <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
  //       <Text style={[styles.packageTitle, { color: customColors.primary }]}>{pkg.title ? String(pkg.title) : 'Untitled Package'}</Text>
  //       {pkg.tags && pkg.tags.includes('premium') && (
  //         <Ionicons name="star" size={18} color="#FFD700" style={{ marginLeft: 8 }} />
  //       )}
  //     </View>
  //     <Text style={[styles.packageCalories, { color: customColors.text }]}>Total Calories: {calculatePackageTotalCalories(pkg)}</Text>
  //     <Text style={{ color: customColors.text, fontStyle: 'italic', marginBottom: 8 }}>
  //       Goal: {pkg.goal ? String(pkg.goal) : 'Unknown'}
  //     </Text>
  //     {['breakfast', 'lunch', 'snack', 'dinner'].map(cat => (
  //       <View key={cat} style={styles.packageSection}>
  //         <Text style={[styles.packageSectionTitle, { color: customColors.secondary }]}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</Text>
  //         {pkg.meals && pkg.meals.filter(m => m.category === cat).length === 0 && (
  //           <Text style={[styles.packageMeal, { color: customColors.text, fontStyle: 'italic' }]}>No meals</Text>
  //         )}
  //         {pkg.meals && pkg.meals.filter(m => m.category === cat).map((m, i) => (
  //           <Text key={i} style={[styles.packageMeal, { color: customColors.text }]}>- {m.meal?.name ? String(m.meal.name) : 'Meal'}: {m.scaledQuantity ? m.scaledQuantity.toFixed(1) : (m.originalQuantity ?? '1')} {m.unit ? String(m.unit) : ''}</Text>
  //         ))}
  //       </View>
  //     ))}
  //   </View>
  // );

  const renderToggle = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
      {TOGGLE_OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.key}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 20,
            backgroundColor: toggle === opt.key ? customColors.primary : customColors.surface,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: customColors.primary,
          }}
          onPress={() => setToggle(opt.key)}
        >
          <Text style={{ color: toggle === opt.key ? '#fff' : customColors.primary, fontWeight: 'bold' }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMealTypeSelector = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 12 }}>
      {MEAL_TYPE_OPTIONS.map(type => (
        <TouchableOpacity
          key={type.value}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 18,
            borderRadius: 20,
            backgroundColor: selectedMealType === type.value ? customColors.primary : customColors.surface,
            marginHorizontal: 4,
            borderWidth: 1,
            borderColor: customColors.primary,
          }}
          onPress={() => setSelectedMealType(type.value)}
        >
          <Text style={{ color: selectedMealType === type.value ? '#fff' : customColors.primary, fontWeight: 'bold' }}>{type.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaViewRN style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={customColors.primary} />
          <Text style={[styles.loadingText, { color: customColors.text }]}>
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
    <SafeAreaViewRN style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: customColors.surface, borderBottomColor: customColors.border }]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: customColors.text }]}>Meal Suggestions</Text>
        <View style={{ width: 24 }} /> {/* Spacer for centering */}
      </View>
      {renderToggle()}
      {toggle === 'packages' ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={[styles.noPackagesText, {color:customColors.text, fontSize:16}]}>Meal Packages feature is in development. Please use Individual Suggestions for now.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {renderMealTypeSelector()}
          <SectionList
            ListHeaderComponent={
              <View style={[styles.premiumInputContainer, { backgroundColor: customColors.surface, borderColor: customColors.primary, borderWidth: 1 }]}> 
                <Text style={[styles.premiumLabel, { color: customColors.primary }]}>Enter custom ingredients (comma separated):</Text>
                <TextInput
                  style={[styles.premiumInput, { color: customColors.text, borderColor: customColors.primary }]}
                  placeholder="e.g. chicken, rice, broccoli"
                  placeholderTextColor={customColors.text + '80'}
                  value={customIngredients}
                  onChangeText={text => {
                    if (!isPremiumUser) {
                      Alert.alert('Premium Feature', 'Custom ingredient search is only for premium users.');
                      return;
                    }
                    setCustomIngredients(text);
                  }}
                  // editable={isPremiumUser}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.refreshButton, { backgroundColor: customColors.primary, marginTop: 4 }]}
                  onPress={() => getMealSuggestions()}
                >
                  <Text style={styles.refreshButtonText}>Search Meals</Text>
                </TouchableOpacity>
              </View>
            }
            sections={[{ title: selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1), data: suggestions }]}
            keyExtractor={(item) => item._id || item.id}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={[styles.sectionHeader, { color: customColors.text }]}>{title}</Text>
            )}
            renderItem={({ item, section }) => {
              const meal = item;
              const mealId = meal._id || meal.id;
              const availableUnits = meal.units.filter(u => ALLOWED_UNITS.includes(u.unit));
              const selectedUnit = unitSelections[mealId] || (availableUnits[0]?.unit || 'plate');
              const { qty, totalCalories } = getRecommendedQuantity(meal, selectedUnit, section.title);
              return (
                <View style={[styles.mealCard, { backgroundColor: customColors.card }]}>
                  {meal.imageUrl ? (
                    <Image source={{ uri: meal.imageUrl }} style={styles.image} resizeMode="cover" />
                  ) : (
                    <View style={[styles.image, { backgroundColor: '#222', justifyContent: 'center', alignItems: 'center' }]}>
                      <Ionicons name="fast-food-outline" size={40} color="#bbb" />
                    </View>
                  )}
                  <Text style={[styles.mealName, { color: customColors.text }]}>{meal.name}</Text>
                  
                  <View style={styles.tagsRow}>
                    {meal.tags?.map(tag => (
                      <View key={tag} style={[styles.tag, { backgroundColor: customColors.primary + '33' }]}>
                        <Text style={[styles.tagText, { color: customColors.primary }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Nutrition Information */}
                  {renderNutritionInfo(meal, selectedUnit)}

                  {/* Ingredients Section */}
                  <TouchableOpacity onPress={() => handleToggleExpand(mealId)} style={styles.ingredientToggle}>
                    <Text style={[styles.ingredientToggleText, { color: customColors.primary }]}>Ingredients</Text>
                    <Ionicons name={expanded[mealId] ? 'chevron-up' : 'chevron-down'} size={18} color={customColors.primary} />
                  </TouchableOpacity>
                  {expanded[mealId] && (
                    <View style={styles.ingredientList}>
                      {meal.ingredients?.map((ing, idx) => (
                        <Text key={idx} style={[styles.ingredient, { color: customColors.text }]}>{ing}</Text>
                      ))}
                    </View>
                  )}

                  {/* Recipe Section */}
                  <TouchableOpacity onPress={() => handleToggleRecipe(mealId)} style={styles.recipeToggle}>
                    <Text style={[styles.recipeToggleText, { color: customColors.primary }]}>Recipe</Text>
                    <Ionicons name={recipeExpanded[mealId] ? 'chevron-up' : 'chevron-down'} size={18} color={customColors.primary} />
                  </TouchableOpacity>
                  {recipeExpanded[mealId] && renderRecipe(meal)}

                  <View style={styles.unitRow}>
                    <Text style={[styles.unitLabel, { color: customColors.text }]}>Unit:</Text>
                    <View style={styles.unitDropdown}>
                      {availableUnits.map(u => (
                        <TouchableOpacity
                          key={u.unit}
                          style={[styles.unitOption, selectedUnit === u.unit && styles.unitOptionSelected, selectedUnit === u.unit && { backgroundColor: customColors.primary }]}
                          onPress={() => handleUnitChange(mealId, u.unit)}
                        >
                          <Text style={[selectedUnit === u.unit ? styles.unitTextSelected : styles.unitText, { color: selectedUnit === u.unit ? '#fff' : customColors.text }]}>{u.unit}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                  <Text style={[styles.recommendation, { color: customColors.text }]}>
                    Recommended: Eat <Text style={[styles.bold, { color: customColors.primary }]}>{qty}</Text> {selectedUnit} — <Text style={[styles.bold, { color: customColors.primary }]}>{totalCalories}</Text> calories
                  </Text>
                </View>
              );
            }}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
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
  packagesContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  packagesHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  packageCard: {
    marginBottom: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  packageCalories: {
    fontSize: 16,
    fontWeight: '600',
  },
  packageSection: {
    marginBottom: 8,
  },
  packageSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  packageMeal: {
    fontSize: 14,
  },
  noPackagesText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default MealSuggestionsScreen; 