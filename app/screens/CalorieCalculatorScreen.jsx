import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const CalorieCalculatorScreen = () => {
  const { theme } = useTheme();
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activityLevel, setActivityLevel] = useState('light');
  const [result, setResult] = useState(null);

  const calculateCalories = () => {
    if (!age || !weight || !height) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    let bmr;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * parseFloat(weight)) + (4.799 * parseFloat(height)) - (5.677 * parseFloat(age));
    } else {
      bmr = 447.593 + (9.247 * parseFloat(weight)) + (3.098 * parseFloat(height)) - (4.330 * parseFloat(age));
    }

    let totalCalories;
    switch (activityLevel) {
      case 'sedentary':
        totalCalories = bmr * 1.2;
        break;
      case 'light':
        totalCalories = bmr * 1.375;
        break;
      case 'moderate':
        totalCalories = bmr * 1.55;
        break;
      case 'active':
        totalCalories = bmr * 1.725;
        break;
      case 'veryActive':
        totalCalories = bmr * 1.9;
        break;
      default:
        totalCalories = bmr * 1.375;
    }

    setResult(Math.round(totalCalories));
  };

  const GenderButton = ({ title, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        {
          backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
        },
      ]}
      onPress={() => setGender(title.toLowerCase())}
    >
      <Text style={[styles.buttonText, { color: theme.colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityButton = ({ title, value, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.activityButton,
        {
          backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
        },
      ]}
      onPress={() => setActivityLevel(value)}
    >
      <Text style={[styles.buttonText, { color: theme.colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Age</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }]}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Enter your age"
            placeholderTextColor={theme.colors.text}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Gender</Text>
          <View style={styles.genderContainer}>
            <GenderButton title="Male" isSelected={gender === 'male'} />
            <GenderButton title="Female" isSelected={gender === 'female'} />
          </View>

          <Text style={[styles.label, { color: theme.colors.text }]}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter your weight"
            placeholderTextColor={theme.colors.text}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            }]}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Enter your height"
            placeholderTextColor={theme.colors.text}
          />

          <Text style={[styles.label, { color: theme.colors.text }]}>Activity Level</Text>
          <View style={styles.activityContainer}>
            <ActivityButton
              title="Sedentary"
              value="sedentary"
              isSelected={activityLevel === 'sedentary'}
            />
            <ActivityButton
              title="Light Exercise (1-3 times/week)"
              value="light"
              isSelected={activityLevel === 'light'}
            />
            <ActivityButton
              title="Moderate Exercise (3-5 times/week)"
              value="moderate"
              isSelected={activityLevel === 'moderate'}
            />
            <ActivityButton
              title="Active Exercise (6-7 times/week)"
              value="active"
              isSelected={activityLevel === 'active'}
            />
            <ActivityButton
              title="Very Active (2x exercise/day)"
              value="veryActive"
              isSelected={activityLevel === 'veryActive'}
            />
          </View>

          <TouchableOpacity
            style={[styles.calculateButton, { backgroundColor: theme.colors.primary }]}
            onPress={calculateCalories}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>

          {result && (
            <View style={[styles.resultContainer, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.resultText, { color: theme.colors.text }]}>
                Your daily calorie needs:
              </Text>
              <Text style={[styles.resultNumber, { color: theme.colors.primary }]}>
                {result} calories
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContainer: {
    marginBottom: 16,
    gap: 8,
  },
  activityButton: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  calculateButton: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default CalorieCalculatorScreen; 