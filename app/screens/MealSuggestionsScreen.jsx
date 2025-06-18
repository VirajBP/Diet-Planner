import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MongoDBService from '../services/mongodb.service';

const { width } = Dimensions.get('window');

const MealSuggestionsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const currentWeight = user?.profile?.weight || 70;
  const targetWeight = user?.profile?.targetWeight || 70;
  const isPremiumUser = user?.isPremium || false;

  const calculateAdjustedCalories = (baseCalories) => {
    const DEFAULT_REFERENCE_WEIGHT = 95;
    return Math.round(baseCalories * (targetWeight / DEFAULT_REFERENCE_WEIGHT));
  };

  const getMealSuggestions = async () => {
    try {
      setLoading(true);
      const response = await MongoDBService.getMealSuggestions(
        isPremiumUser ? customIngredients : null,
        currentWeight,
        targetWeight
      );
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
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading meal suggestions...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, { color: theme.colors.text }]}>Meal Suggestions</Text>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Weight Info Card */}
        <Card style={[styles.weightCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.weightInfo}>
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.colors.text }]}>Current Weight</Text>
              <Text style={[styles.weightValue, { color: theme.colors.primary }]}>{currentWeight}</Text>
              <Text style={[styles.weightUnit, { color: theme.colors.text }]}>kg</Text>
            </View>
            <View style={styles.weightDivider} />
            <View style={styles.weightItem}>
              <Text style={[styles.weightLabel, { color: theme.colors.text }]}>Target Weight</Text>
              <Text style={[styles.weightValue, { color: theme.colors.primary }]}>{targetWeight}</Text>
              <Text style={[styles.weightUnit, { color: theme.colors.text }]}>kg</Text>
            </View>
          </View>
          <Text style={[styles.infoMessage, { color: theme.colors.text + '80' }]}>
            Meals are automatically adjusted based on your current and target weight
          </Text>
        </Card>

        {/* Premium Ingredients Input */}
        {isPremiumUser ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={customIngredients}
              onChangeText={setCustomIngredients}
              placeholder="Enter ingredients (comma-separated)"
              placeholderTextColor={theme.colors.text + '80'}
              multiline
            />
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={getMealSuggestions}
            >
              <Text style={styles.buttonText}>Get Custom Suggestions</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Card style={[styles.premiumCard, { backgroundColor: theme.colors.card }]}>
            <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
            <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>
              Premium Feature
            </Text>
            <Text style={[styles.premiumText, { color: theme.colors.text + '80' }]}>
              Upgrade to premium to get personalized meal suggestions based on your preferred ingredients
            </Text>
          </Card>
        )}

        {/* Suggestions Display */}
        {suggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            {Object.entries(suggestions).map(([mealType, meals]) => (
              <View key={mealType} style={styles.mealTypeSection}>
                <Text style={[styles.mealTypeTitle, { color: theme.colors.text }]}>
                  {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {meals.map((meal, index) => (
                    <Card 
                      key={`${mealType}-${index}`}
                      style={[styles.mealCard, { backgroundColor: theme.colors.card }]}
                    >
                      <View style={styles.mealContent}>
                        <Text style={[styles.mealName, { color: theme.colors.text }]}>
                          {meal.name}
                        </Text>
                        <Text style={[styles.calories, { color: theme.colors.primary }]}>
                          {calculateAdjustedCalories(meal.calories)} calories
                        </Text>
                        <View style={styles.tags}>
                          {meal.tags?.map((tag, tagIndex) => (
                            <View 
                              key={`${mealType}-${index}-${tagIndex}`}
                              style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}
                            >
                              <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <Text style={[styles.description, { color: theme.colors.text + '80' }]}>
                          {meal.description || 'A delicious and nutritious meal option'}
                        </Text>
                      </View>
                    </Card>
                  ))}
                </ScrollView>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noResultsContainer}>
            <Ionicons 
              name="restaurant-outline" 
              size={48} 
              color={theme.colors.text + '40'} 
            />
            <Text style={[styles.noResults, { color: theme.colors.text + '80' }]}>
              No suitable meals found at the moment
            </Text>
          </View>
        )}
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
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  weightCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  weightInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weightItem: {
    flex: 1,
    alignItems: 'center',
  },
  weightLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  weightUnit: {
    fontSize: 14,
    marginTop: 4,
  },
  weightDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 16,
  },
  infoMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    textAlignVertical: 'top',
  },
  button: {
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: 16,
  },
  mealTypeSection: {
    marginBottom: 24,
  },
  mealTypeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  mealCard: {
    width: width * 0.7,
    marginRight: 12,
    borderRadius: 8,
  },
  mealContent: {
    padding: 16,
  },
  mealName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  calories: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 48,
  },
  noResults: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  premiumCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  premiumText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MealSuggestionsScreen; 