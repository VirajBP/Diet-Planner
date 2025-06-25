import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
// import {customColors} from ''
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';


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

const NutritionSearchScreen = () => {
  const { theme } = useTheme();
  const isDark=theme.dark
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchInfo, setSearchInfo] = useState(null);
  const navigation = useNavigation();
  const customColors = isDark? FRESH_CALM_DARK:FRESH_CALM_LIGHT
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Error', 'Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for:', searchQuery);
      const results = await mongodbService.searchNutrition(searchQuery);
      console.log('Search results:', results);
      setSearchResults(results.meals || []);
      setSearchInfo(results.searchInfo || null);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search for nutrition information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = async (text) => {
    setSearchQuery(text);
    
    // Get suggestions for partial queries
    if (text.length >= 2) {
      try {
        const response = await mongodbService.getSearchSuggestions(text);
        setSuggestions(response.suggestions || []);
      } catch (error) {
        console.error('Error getting suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (suggestion) => {
    setSearchQuery(suggestion.name);
    setSuggestions([]);
    handleSearch();
  };

  const testAllMeals = async () => {
    setLoading(true);
    try {
      const data = await mongodbService.getAllMeals();
      console.log('All meals:', data);
      Alert.alert('Debug', `Found ${data.count} meals in database`);
    } catch (error) {
      console.error('Test error:', error);
      Alert.alert('Error', 'Failed to test meals endpoint');
    } finally {
      setLoading(false);
    }
  };

  const handleMealSelect = async (meal) => {
    setLoading(true);
    try {
      const mealInfo = await mongodbService.getMealInfo(meal._id);
      setSelectedMeal(mealInfo);
    } catch (error) {
      console.error('Error fetching meal info:', error);
      Alert.alert('Error', 'Failed to load meal details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderNutritionItem = ({ item }) => {
    const isPredefined = item.units && item.units.length > 0;
    const firstUnit = isPredefined ? item.units[0] : null;

    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: theme.colors.card }]}
        onPress={() => {
          handleMealSelect(item);
          setShowModal(true);
        }}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: theme.colors.text }]}>
            {item.name || item.food?.label}
          </Text>
          <View style={styles.itemBadges}>
            {isPredefined && (
              <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.badgeText}>Predefined</Text>
              </View>
            )}
            {item.relevance && (
              <View style={[styles.relevanceBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.badgeText}>{item.relevance}%</Text>
              </View>
            )}
          </View>
        </View>
        
        {isPredefined && firstUnit && (
          <View style={styles.nutritionPreview}>
            <Text style={[styles.nutritionText, { color: theme.colors.text }]}>
              {firstUnit.calories} cal • {firstUnit.protein}g protein • {firstUnit.carbs}g carbs • {firstUnit.fat}g fat
            </Text>
          </View>
        )}
        
        {!isPredefined && item.food?.nutrients && (
          <View style={styles.nutritionPreview}>
            <Text style={[styles.nutritionText, { color: theme.colors.text }]}>
              {Math.round(item.food.nutrients.ENERC_KCAL || 0)} cal • {Math.round(item.food.nutrients.PROCNT || 0)}g protein
            </Text>
          </View>
        )}

        {item.searchKeywords && (
          <View style={styles.keywordsContainer}>
            <Text style={[styles.keywordsText, { color: theme.colors.text + '60' }]}>
              Keywords: {item.searchKeywords.slice(0, 5).join(', ')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderNutritionModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedMeal?.name || selectedMeal?.food?.label}
            </Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedMeal?.units && selectedMeal.units.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Nutrition per Unit</Text>
                {selectedMeal.units.map((unit, index) => (
                  <View key={index} style={[styles.unitCard, { backgroundColor: theme.colors.card }]}>
                    <Text style={[styles.unitName, { color: theme.colors.primary }]}>
                      {unit.unit} ({unit.calories} calories)
                    </Text>
                    <View style={styles.nutritionGrid}>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionLabel, { color: theme.colors.text }]}>Protein</Text>
                        <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>{unit.protein}g</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionLabel, { color: theme.colors.text }]}>Carbs</Text>
                        <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>{unit.carbs}g</Text>
                      </View>
                      <View style={styles.nutritionItem}>
                        <Text style={[styles.nutritionLabel, { color: theme.colors.text }]}>Fat</Text>
                        <Text style={[styles.nutritionValue, { color: theme.colors.text }]}>{unit.fat}g</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedMeal?.ingredients && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ingredients</Text>
                <Text style={[styles.ingredientsText, { color: theme.colors.text }]}>
                  {selectedMeal.ingredients.join(', ')}
                </Text>
              </View>
            )}

            {selectedMeal?.recipe && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Recipe</Text>
                {selectedMeal.recipe.map((step, index) => (
                  <View key={index} style={styles.recipeStep}>
                    <Text style={[styles.stepNumber, { color: theme.colors.primary }]}>{index + 1}.</Text>
                    <Text style={[styles.stepText, { color: theme.colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedMeal?.tags && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Tags</Text>
                <View style={styles.tagsContainer}>
                  {selectedMeal.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 , flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        <Text style={[styles.title, { color: theme.colors.text }]}>Nutrition Search</Text>
        </TouchableOpacity>
        <Text style={[styles.subtitle, { color: theme.colors.text + '80' }]}>
          Search for food items to view nutrition information
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.colors.card, color: theme.colors.text }]}
          placeholder="Search for food items..."
          placeholderTextColor={theme.colors.text + '60'}
          value={searchQuery}
          onChangeText={handleSearchChange}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: customColors.primary }]}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: customColors.card }]}
          onPress={testAllMeals}
        >
          <Ionicons name="bug" size={20} color={customColors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <View style={[styles.suggestionsContainer, { backgroundColor: theme.colors.card }]}>
          {suggestions.map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionItem}
              onPress={() => selectSuggestion(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: theme.colors.text }]}>
                {suggestion.name}
              </Text>
              <Text style={[styles.suggestionCategory, { color: theme.colors.text + '60' }]}>
                {suggestion.category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search Info */}
      {searchInfo && (
        <View style={[styles.searchInfoContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.searchInfoText, { color: theme.colors.text }]}>
            Found {searchInfo.resultsCount} results for "{searchInfo.query}"
          </Text>
          {searchInfo.relevanceScores && (
            <Text style={[styles.searchInfoText, { color: theme.colors.text + '80' }]}>
              Strategy: {searchInfo.strategy}
            </Text>
          )}
        </View>
      )}

      {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}

      <FlatList
        data={searchResults}
        renderItem={renderNutritionItem}
        keyExtractor={(item, index) => index.toString()}
        style={styles.resultsList}
        contentContainerStyle={styles.resultsContainer}
        ListEmptyComponent={
          !loading && searchQuery ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.text + '40'} />
              <Text style={[styles.emptyText, { color: theme.colors.text + '60' }]}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          ) : null
        }
      />

      {renderNutritionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchButton: {
    padding: 12,
    borderRadius: 12,
    marginLeft: 8,
  },
  resultsList: {
    flex: 1,
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  itemBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  nutritionPreview: {
    marginTop: 4,
  },
  nutritionText: {
    fontSize: 14,
    opacity: 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  modalBody: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  unitCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  unitName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
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
    opacity: 0.7,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  ingredientsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  recipeStep: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 12,
    minWidth: 20,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  testButton: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 8,
  },
  suggestionsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionCategory: {
    fontSize: 14,
    opacity: 0.7,
  },
  searchInfoContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  searchInfoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  relevanceBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  keywordsContainer: {
    marginTop: 12,
  },
  keywordsText: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default NutritionSearchScreen; 