import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const WeightLogScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [showCustomIngredients, setShowCustomIngredients] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    loadWeightLogs();
  }, []);

  const showPremiumPrompt = () => {
    Alert.alert(
      'Premium Feature',
      'Weight tracking is a premium feature. Would you like to upgrade to premium to access this and other premium features?',
      [
        {
          text: 'Not Now',
          style: 'cancel'
        },
        {
          text: 'Learn More',
          onPress: () => {
            // Navigate to premium screen or show premium features
            Alert.alert('Coming Soon', 'Premium features will be available soon!');
          }
        }
      ]
    );
  };

  const loadWeightLogs = async () => {
    try {
      setLoading(true);
      const logs = await mongodbService.getWeightLogs();
      setWeightLogs(logs);
    } catch (error) {
      console.error('Error loading weight logs:', error);
      Alert.alert('Error', 'Failed to load weight logs');
    } finally {
      setLoading(false);
    }
  };

  const addWeightLog = async () => {
    if (!newWeight || isNaN(newWeight) || parseFloat(newWeight) <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }

    try {
      setLoading(true);
      await mongodbService.addWeightLog({ weight: parseFloat(newWeight) });
      setNewWeight('');
      await loadWeightLogs();
      Alert.alert('Success', 'Weight log added');
    } catch (error) {
      console.error('Error adding weight log:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteWeightLog = async (logId) => {
    try {
      setLoading(true);
      await mongodbService.deleteWeightLog(logId);
      await loadWeightLogs();
    } catch (error) {
      console.error('Error deleting weight log:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    if (!user.isPremium) {
      Alert.alert(
        'Premium Feature',
        'Custom ingredient suggestions are only available for premium users.',
        [
          {
            text: 'OK',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    if (!customIngredients) {
      Alert.alert('Error', 'Please enter ingredients');
      return;
    }

    try {
      const ingredients = customIngredients.split(',').map(i => i.trim());
      const response = await mongodbService.getMealSuggestions(ingredients);
      setSuggestions(response.suggestions);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderPremiumFeature = (title) => (
    <TouchableOpacity
      style={[styles.premiumFeature, { backgroundColor: theme.colors.card }]}
      onPress={showPremiumPrompt}
    >
      <Ionicons name="lock-closed" size={20} color={theme.colors.text} />
      <Text style={[styles.premiumText, { color: theme.colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const getChartData = () => {
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return {
      labels: sortedLogs.slice(-7).map(log => formatDate(log.createdAt).split(',')[0]),
      datasets: [{
        data: sortedLogs.slice(-7).map(log => log.weight)
      }]
    };
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Weight Tracker</Text>
          {!user?.isPremium && (
            <Text style={[styles.premiumNote, { color: theme.colors.text }]}>
              ⭐ Upgrade to Premium to track your weight progress
            </Text>
          )}
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border }]}
            placeholder="Enter weight in kg"
            placeholderTextColor={theme.colors.text + '80'}
            keyboardType="numeric"
            value={newWeight}
            onChangeText={setNewWeight}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
            onPress={addWeightLog}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Add Weight</Text>
          </TouchableOpacity>
        </View>

        {/* Premium Features */}
        <View style={styles.premiumContainer}>
          {renderPremiumFeature('Set Weight Goal')}
          {renderPremiumFeature('BMI Calculator')}
          {renderPremiumFeature('Progress Photos')}
        </View>

        {/* Weight Chart (Premium Preview) */}
        <TouchableOpacity
          style={[styles.chartContainer, { backgroundColor: theme.colors.card }]}
          onPress={() => Alert.alert('Premium Feature', 'Upgrade to premium to access detailed charts!')}
        >
          <View style={styles.chartOverlay}>
            <Ionicons name="lock-closed" size={40} color={theme.colors.text} />
            <Text style={[styles.chartOverlayText, { color: theme.colors.text }]}>
              Unlock Premium for Detailed Charts
            </Text>
          </View>
          {weightLogs.length > 0 && (
            <LineChart
              data={getChartData()}
              width={320}
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 1,
                color: (opacity = 1) => theme.colors.primary + opacity * 255,
                labelColor: () => theme.colors.text,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
                opacity: 0.5,
              }}
            />
          )}
        </TouchableOpacity>

        <View style={[styles.logsContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.logsTitle, { color: theme.colors.text }]}>Weight History</Text>
          <ScrollView style={styles.logsList}>
            {user?.isPremium ? (
              weightLogs.length > 0 ? (
                weightLogs.map((log, index) => (
                  <View
                    key={index}
                    style={[styles.logEntry, { borderBottomColor: theme.colors.border }]}
                  >
                    <Text style={[styles.logWeight, { color: theme.colors.text }]}>
                      {log.weight} kg
                    </Text>
                    <Text style={[styles.logDate, { color: theme.colors.text + '80' }]}>
                      {formatDate(log.createdAt)}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                  No weight logs yet
                </Text>
              )
            ) : (
              <Text style={[styles.emptyText, { color: theme.colors.text }]}>
                Upgrade to premium to view weight history
              </Text>
            )}
          </ScrollView>
        </View>

        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowCustomIngredients(!showCustomIngredients)}
        >
          <Text style={styles.buttonText}>
            {showCustomIngredients ? 'Hide Custom Ingredients' : 'Show Custom Ingredients'}
          </Text>
        </TouchableOpacity>

        {showCustomIngredients && (
          <View style={[styles.customIngredientsContainer, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.subtitle, { color: theme.colors.text }]}>
              Custom Ingredients (Premium)
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.inputBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }]}
              value={customIngredients}
              onChangeText={setCustomIngredients}
              placeholder="Enter ingredients (comma-separated)"
              placeholderTextColor={theme.colors.text}
              multiline
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleGetSuggestions}
            >
              <Text style={styles.buttonText}>Get Suggestions</Text>
            </TouchableOpacity>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.subtitle, { color: theme.colors.text }]}>
                  Suggested Meals
                </Text>
                {suggestions.map((suggestion, index) => (
                  <View
                    key={index}
                    style={[styles.suggestionItem, { backgroundColor: theme.colors.inputBackground }]}
                  >
                    <Text style={[styles.suggestionName, { color: theme.colors.text }]}>
                      {suggestion.name}
                    </Text>
                    <Text style={[styles.suggestionCalories, { color: theme.colors.primary }]}>
                      {suggestion.calories} calories
                    </Text>
                  </View>
                ))}
              </View>
            )}
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
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  premiumNote: {
    fontSize: 16,
    marginTop: 8,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  addButton: {
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  premiumContainer: {
    marginBottom: 20,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  premiumText: {
    marginLeft: 8,
    fontSize: 16,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    zIndex: 1,
  },
  chartOverlayText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
  },
  logsContainer: {
    flex: 1,
    borderRadius: 10,
    padding: 16,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logsList: {
    flex: 1,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logWeight: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  logDate: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  toggleButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  customIngredientsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  suggestionsContainer: {
    marginTop: 24,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionName: {
    fontSize: 16,
    marginBottom: 4,
  },
  suggestionCalories: {
    fontSize: 14,
  },
});

export default WeightLogScreen; 