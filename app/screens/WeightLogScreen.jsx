import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
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
import { getExpectedBMIRange } from '../utils/bmiUtils';

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

const WeightLogScreen = () => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [weightLogs, setWeightLogs] = useState([]);
  const [newWeight, setNewWeight] = useState('');
  const [showChart, setShowChart] = useState(false);
  const [showCustomIngredients, setShowCustomIngredients] = useState(false);
  const [customIngredients, setCustomIngredients] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [bmiWeight, setBmiWeight] = useState('');
  const [bmiHeight, setBmiHeight] = useState('');
  const [bmiResult, setBmiResult] = useState(null);
  const [bmiAge, setBmiAge] = useState(user?.profile?.age ? String(user.profile.age) : '');
  const [bmiModalVisible, setBmiModalVisible] = useState(false);
  const [bmiExpected, setBmiExpected] = useState(null);
  const [bmiStatus, setBmiStatus] = useState('');
  const [weightGoal, setWeightGoal] = useState(user?.profile?.targetWeight?.toString() || '');
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

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
      // console.error('Error loading weight logs:', error);
      // Alert.alert('Error', 'Failed to load weight logs');
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
      console.log(logId)
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderPremiumFeature = (title) => (
    <TouchableOpacity
      style={[styles.premiumFeature, { backgroundColor: customColors.card }]}
      onPress={showPremiumPrompt}
    >
      <Ionicons name="lock-closed" size={20} color={customColors.text} />
      <Text style={[styles.premiumText, { color: customColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const getChartData = () => {
    const sortedLogs = [...weightLogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    return {
      labels: sortedLogs.slice(-7).map(log => formatDateTime(log.createdAt).split(',')[0]),
      datasets: [{
        data: sortedLogs.slice(-7).map(log => log.weight)
      }]
    };
  };

  const calculateBMI = () => {
    const weight = parseFloat(bmiWeight);
    const height = parseFloat(bmiHeight);
    const age = parseInt(bmiAge);
    if (!weight || !height || height <= 0 || !age || age < 2) {
      Alert.alert('Error', 'Please enter valid weight, height, and age');
      return;
    }
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    setBmiResult(bmi.toFixed(1));
    const expected = getExpectedBMIRange(age);
    setBmiExpected(expected);
    let status = '';
    if (expected.min === null) {
      status = 'BMI is not typically used for this age.';
    } else if (bmi < expected.min) {
      status = 'Below expected range';
    } else if (bmi > expected.max) {
      status = 'Above expected range';
    } else {
      status = 'Within expected range';
    }
    setBmiStatus(status);
    setBmiModalVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.heading, {color:customColors.text}]}>Weight Tracker</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BMI Calculator Section */}
        <View style={[styles.bmiContainer, { backgroundColor: customColors.card }]}> 
          <Text style={[styles.bmiTitle, { color: customColors.text }]}>BMI Calculator</Text>
          <View style={[styles.gapInputrowsbmi]}>
          <View style={styles.bmiInputsRow}>
            <TextInput
              style={[styles.input, { color: customColors.text, borderColor: customColors.border, flex: 1 }]}
              placeholder="Weight (kg)"
              placeholderTextColor={customColors.text + '80'}
              keyboardType="numeric"
              value={bmiWeight}
              onChangeText={setBmiWeight}
            />
            <TextInput
              style={[styles.input, { color: customColors.text, borderColor: customColors.border, flex: 1, marginLeft: 8 }]}
              placeholder="Height (cm)"
              placeholderTextColor={customColors.text + '80'}
              keyboardType="numeric"
              value={bmiHeight}
              onChangeText={setBmiHeight}
            />
            
          </View>
          <View style={[styles.bmiInputsRow]}>
          <TextInput
              style={[styles.input, { color: customColors.text, borderColor: customColors.border, flex: 1,  },{width:'50%'}, styles.bmisecondlevelboxes]}
              placeholder="Age"
              placeholderTextColor={customColors.text + '80'}
              keyboardType="numeric"
              value={bmiAge}
              onChangeText={setBmiAge}
            />
            <TouchableOpacity style={[styles.addButton, { backgroundColor: customColors.primary, marginLeft: 8, marginRight:10 }]} onPress={calculateBMI}>
              <Text style={styles.buttonText}>Calculate</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
        <Modal
          visible={bmiModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setBmiModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }}>
            <View style={{ width: '80%', borderRadius: 16, padding: 24, alignItems: 'center', backgroundColor: customColors.card, elevation: 8 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: customColors.primary, marginBottom: 16, textAlign: 'center' }}>BMI Result</Text>
              {bmiResult && (
                <>
                  <Text style={{ fontSize: 18, color: customColors.text, marginBottom: 8 }}>Your BMI: <Text style={{ color: customColors.primary }}>{bmiResult}</Text></Text>
                  {bmiExpected && bmiExpected.min !== null ? (
                    <Text style={{ fontSize: 16, color: customColors.text, marginBottom: 8 }}>Expected BMI for age {bmiAge}: <Text style={{ color: customColors.primary }}>{bmiExpected.min} - {bmiExpected.max}</Text></Text>
                  ) : (
                    <Text style={{ fontSize: 16, color: customColors.text, marginBottom: 8 }}>No expected BMI range for this age.</Text>
                  )}
                  <Text style={{ fontSize: 16, color: customColors.text, marginBottom: 16 }}>{bmiStatus}</Text>
                </>
              )}
              <TouchableOpacity style={{ marginTop: 10, paddingVertical: 10, paddingHorizontal: 32, borderRadius: 24, backgroundColor: customColors.primary }} onPress={() => setBmiModalVisible(false)}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* Set Weight Goal Section (Free) */}
        {/* <View style={[styles.bmiContainer, { backgroundColor: theme.colors.card }]}> 
          <Text style={[styles.bmiTitle, { color: theme.colors.text }]}>Set Weight Goal</Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.border, flex: 1 }]}
            placeholder="Target Weight (kg)"
            placeholderTextColor={theme.colors.text + '80'}
            keyboardType="numeric"
            value={weightGoal}
            onChangeText={setWeightGoal}
          />
        </View> */}

        <View style={[styles.inputContainer, { backgroundColor: customColors.card, padding: 20, borderRadius: 12, marginBottom: 20 }]}> 
          <Text style={[styles.bmiTitle, { color: customColors.text, marginBottom: 12, textAlign: 'left', alignSelf: 'flex-start' }]}>Add Weight Log</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', width: '100%' }}>
            <TextInput
              style={[styles.input, { color: customColors.text, borderColor: customColors.border, backgroundColor: customColors.background, width: 140, marginBottom: 0, marginRight: 12 }]}
              placeholder="Enter weight in kg"
              placeholderTextColor={customColors.text + '80'}
              keyboardType="numeric"
              value={newWeight}
              onChangeText={setNewWeight}
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: customColors.primary, width: 100, borderRadius: 8 }]}
              onPress={addWeightLog}
              disabled={loading}
            >
              <Text style={styles.buttonText}>Add Weight</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weight Chart (Premium Preview) */}
        {user?.isPremium ? (
          weightLogs.length > 0 && (
            <View style={[styles.chartContainer, { backgroundColor: customColors.card }]}> 
              <LineChart
                data={getChartData()}
                width={320}
                height={180}
                chartConfig={{
                  backgroundColor: customColors.card,
                  backgroundGradientFrom: customColors.card,
                  backgroundGradientTo: customColors.card,
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 155, 113, ${opacity})`,
                  labelColor: () => customColors.text,
                  style: {
                    borderRadius: 16,
                  },
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </View>
          )
        ) : (
          <TouchableOpacity
            style={[styles.chartContainer, { backgroundColor: customColors.card }]}
            onPress={() => Alert.alert('Premium Feature', 'Upgrade to premium to access detailed charts!')}
          >
            <View style={styles.chartOverlay}>
              <Ionicons name="lock-closed" size={40} color={customColors.text} />
              <Text style={[styles.chartOverlayText, { color: customColors.text }]}>Unlock Premium for Detailed Charts</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={{ marginVertical: 16, alignItems: 'center' }}>
          <TouchableOpacity
            style={{
              backgroundColor: customColors.primary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 24,
              alignItems: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
            onPress={() => navigation.navigate('CalorieCalculator', {
              autofill: true,
              profile: user?.profile || user
            })}
          >
            <Ionicons name="calculator" size={20} color="white" />
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Go to Calorie Calculator</Text>
          </TouchableOpacity>
          <Text style={{ color: customColors.text, marginTop: 8, fontStyle: 'italic', fontSize: 13, marginBottom: 10 }}>
            You can calculate your daily calories. Your profile data will be autofilled.
          </Text>
        </View>

        <View style={[styles.logsContainer, { backgroundColor: customColors.card }]}>
          <Text style={[styles.logsTitle, { color: customColors.text }]}>Weight History</Text>
          <ScrollView style={styles.logsList}>
            {user?.isPremium ? (
              weightLogs.length > 0 ? (
                weightLogs.map((log, index) => (
                  <View
                    key={index}
                    style={[styles.logEntry, { borderBottomColor: customColors.border }]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.logWeight, { color: customColors.text }]}> {log.weight} kg </Text>
                      <Text style={[styles.logDate, { color: customColors.text + '80' }]}> {formatDateTime(log.createdAt)} </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => {
                        Alert.alert(
                          'Delete Log',
                          'Are you sure you want to delete this weight log?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteWeightLog(log._id)
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons name="trash-outline" size={20} color={customColors.error} />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={[styles.emptyText, { color: customColors.text }]}> No weight logs yet </Text>
              )
            ) : (
              <Text style={[styles.emptyText, { color: customColors.text }]}> Upgrade to premium to view weight history </Text>
            )}
          </ScrollView>
        </View>


        {showCustomIngredients && (
          <View style={[styles.customIngredientsContainer, { backgroundColor: customColors.card }]}>
            <Text style={[styles.subtitle, { color: customColors.text }]}>
              Custom Ingredients (Premium)
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.inputBackground,
                color: customColors.text,
                borderColor: customColors.border,
              }]}
              value={customIngredients}
              onChangeText={setCustomIngredients}
              placeholder="Enter ingredients (comma-separated)"
              placeholderTextColor={customColors.text}
              multiline
            />
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: customColors.primary }]}
              onPress={handleGetSuggestions}
            >
              <Text style={styles.buttonText}>Get Suggestions</Text>
            </TouchableOpacity>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <Text style={[styles.subtitle, { color: customColors.text }]}>
                  Suggested Meals
                </Text>
                {suggestions.map((suggestion, index) => (
                  <View
                    key={index}
                    style={[styles.suggestionItem, { backgroundColor: customColors.inputBackground }]}
                  >
                    <Text style={[styles.suggestionName, { color: customColors.text }]}>
                      {suggestion.name}
                    </Text>
                    <Text style={[styles.suggestionCalories, { color: customColors.primary }]}>
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
    flexDirection: 'column',
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
  input2:{
    flex: 1,
    height: 23,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginRight: 20,
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
    marginBottom: 30,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  heading: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  bmiContainer: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    flex:1,
    gap:5,
    // height:90
  },
  bmisecondlevelboxes: {
    width:10
  },
  bmicalculatorsecondlevel: {
    flex:1,
  },
  bmiTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bmiInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gapInputrowsbmi:{
    flex:1,
    gap:15,
  },
  deleteButton: {
    padding: 8,
  },
});

export default WeightLogScreen; 