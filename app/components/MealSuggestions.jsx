import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Card, useTheme as usePaperTheme } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { mongodbService } from '../services/mongodb.service';

const { width } = Dimensions.get('window');

const MealSuggestions = () => {
  const paperTheme = usePaperTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const currentWeight = user?.weight || 0;
  const targetWeight = user?.targetWeight || 0;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    weightCard: {
      marginBottom: 24,
      padding: 16,
      borderRadius: 12,
    },
    weightContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 8,
    },
    weightLabel: {
      fontSize: 14,
      opacity: 0.8,
    },
    weightValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    weightUnit: {
      fontSize: 12,
      opacity: 0.6,
    },
    infoMessage: {
      textAlign: 'center',
      marginTop: 8,
      fontSize: 12,
      opacity: 0.7,
    },
    inputContainer: {
      marginBottom: 24,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    premiumFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
    },
    premiumText: {
      marginLeft: 8,
      fontSize: 14,
    },
    button: {
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
    mealTypeTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    mealCard: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    mealName: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    calories: {
      fontSize: 14,
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      marginRight: 4,
      marginBottom: 4,
    },
    tagText: {
      fontSize: 12,
    },
    description: {
      fontSize: 14,
      lineHeight: 20,
    },
    loadingContainer: {
      marginTop: 48,
      alignItems: 'center',
    },
    noResults: {
      textAlign: 'center',
      marginTop: 24,
      fontSize: 16,
    },
  });

  const handleGetSuggestions = async () => {
    if (!user?.isPremium) {
      Alert.alert(
        'Premium Feature',
        'This feature is only available for premium users. Upgrade to get personalized meal suggestions!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          {
            text: 'Upgrade Now',
            onPress: () => navigation.navigate('Premium'),
          },
        ]
      );
      return;
    }

    if (!customIngredients.trim()) {
      Alert.alert('Error', 'Please enter some ingredients');
      return;
    }

    setLoading(true);
    try {
      const response = await mongodbService.getMealSuggestions(customIngredients);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      console.error('Error getting meal suggestions:', error);
      Alert.alert('Error', 'Failed to get meal suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.heading, { color: paperTheme.colors.text }]}>Meal Suggestions</Text>

      <Card style={[styles.weightCard, { backgroundColor: paperTheme.colors.surface }]}>
        <View style={styles.weightContainer}>
          <View>
            <Text style={[styles.weightLabel, { color: paperTheme.colors.text }]}>Current Weight</Text>
            <Text style={[styles.weightValue, { color: paperTheme.colors.primary }]}>{currentWeight}</Text>
            <Text style={[styles.weightUnit, { color: paperTheme.colors.text }]}>kg</Text>
          </View>
          <View>
            <Text style={[styles.weightLabel, { color: paperTheme.colors.text }]}>Target Weight</Text>
            <Text style={[styles.weightValue, { color: paperTheme.colors.primary }]}>{targetWeight}</Text>
            <Text style={[styles.weightUnit, { color: paperTheme.colors.text }]}>kg</Text>
          </View>
        </View>
        <Text style={[styles.infoMessage, { color: paperTheme.colors.text + '80' }]}>
          Based on your weight goals, we'll suggest meals that help you achieve them.
        </Text>
      </Card>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: paperTheme.colors.surface,
              color: paperTheme.colors.text,
              borderColor: paperTheme.colors.outline,
            },
          ]}
          placeholder="Enter ingredients you have (e.g., chicken, rice, tomatoes)"
          value={customIngredients}
          onChangeText={setCustomIngredients}
          placeholderTextColor={paperTheme.colors.onSurfaceDisabled}
        />

        {!user?.isPremium && (
          <View style={[styles.premiumFeature, { backgroundColor: paperTheme.colors.surfaceVariant }]}>
            <Ionicons name="lock-closed" size={20} color={paperTheme.colors.onSurfaceVariant} />
            <Text style={[styles.premiumText, { color: paperTheme.colors.onSurfaceVariant }]}>
              Available only for premium users
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: paperTheme.colors.primary }]}
          onPress={handleGetSuggestions}
        >
          <Text style={styles.buttonText}>Get Suggestions</Text>
        </TouchableOpacity>
      </View>

      {suggestions.map((mealType, index) => (
        <View key={index} style={{ marginBottom: 24 }}>
          <Text style={[styles.mealTypeTitle, { color: paperTheme.colors.text }]}>
            {mealType.type}
          </Text>

          {mealType.meals.map((meal, mealIndex) => (
            <View
              key={mealIndex}
              style={[styles.mealCard, { backgroundColor: paperTheme.colors.surfaceVariant }]}
            >
              <Text style={[styles.mealName, { color: paperTheme.colors.text }]}>
                {meal.name}
              </Text>
              <Text style={[styles.calories, { color: paperTheme.colors.primary }]}>
                {meal.calories} calories
              </Text>

              <View style={styles.tagsContainer}>
                {meal.tags.map((tag, tagIndex) => (
                  <View
                    key={tagIndex}
                    style={[styles.tag, { backgroundColor: paperTheme.colors.primaryContainer }]}
                  >
                    <Text style={[styles.tagText, { color: paperTheme.colors.onPrimaryContainer }]}>
                      {tag}
                    </Text>
                  </View>
                ))}
              </View>

              <Text style={[styles.description, { color: paperTheme.colors.onSurfaceVariant }]}>
                {meal.description}
              </Text>
            </View>
          ))}
        </View>
      ))}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={paperTheme.colors.primary} />
        </View>
      )}

      {!loading && suggestions.length === 0 && customIngredients.trim() !== '' && (
        <Text style={[styles.noResults, { color: paperTheme.colors.onSurfaceVariant }]}>
          No meal suggestions found. Try different ingredients!
        </Text>
      )}
    </ScrollView>
  );
};

export default MealSuggestions; 