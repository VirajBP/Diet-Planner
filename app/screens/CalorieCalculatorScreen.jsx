import { useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons'

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

const CalorieCalculatorScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const route = useRoute();
  const navigation = useNavigation();
  const isDark = theme.dark;
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const autofillProfile = route.params?.autofill && (route.params?.profile || user?.profile);
  const profile = route.params?.profile || user?.profile;
  const [age, setAge] = useState(autofillProfile ? String(profile?.age || '') : '');
  const [gender, setGender] = useState(autofillProfile ? (profile?.gender || 'male') : 'male');
  const [weight, setWeight] = useState(autofillProfile ? String(profile?.weight || '') : '');
  const [height, setHeight] = useState(autofillProfile ? String(profile?.height || '') : '');
  const [activityLevel, setActivityLevel] = useState('light');
  const [modalVisible, setModalVisible] = useState(false);
  const [calorieResults, setCalorieResults] = useState(null);

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

    let activityMultiplier;
    switch (activityLevel) {
      case 'sedentary':
        activityMultiplier = 1.2;
        break;
      case 'light':
        activityMultiplier = 1.375;
        break;
      case 'moderate':
        activityMultiplier = 1.55;
        break;
      case 'active':
        activityMultiplier = 1.725;
        break;
      case 'veryActive':
        activityMultiplier = 1.9;
        break;
      default:
        activityMultiplier = 1.375;
    }

    const maintain = Math.round(bmr * activityMultiplier);
    const lose = Math.round(maintain - 500);
    const gain = Math.round(maintain + 500);
    setCalorieResults({ maintain, lose, gain });
    setModalVisible(true);
  };

  const GenderButton = ({ title, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.genderButton,
        {
          backgroundColor: isSelected ? customColors.primary : customColors.card,
        },
      ]}
      onPress={() => setGender(title.toLowerCase())}
    >
      <Text style={[styles.buttonText, { color: customColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const ActivityButton = ({ title, value, isSelected }) => (
    <TouchableOpacity
      style={[
        styles.activityButton,
        {
          backgroundColor: isSelected ? customColors.primary : customColors.card,
        },
      ]}
      onPress={() => setActivityLevel(value)}
    >
      <Text style={[styles.buttonText, { color: customColors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 , flexDirection: 'row', alignItems: 'center', gap: 10, margin: 10}}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Calorie Calculator</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {autofillProfile && (
          <Text style={{ color: customColors.primary, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' }}>
            Your data has been autofilled from your profile.
          </Text>
        )}
        <View style={styles.card}>
          <Text style={[styles.label, { color: customColors.text }]}>Age</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.inputBackground,
              color: customColors.text,
              borderColor: customColors.border,
            }]}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Enter your age"
            placeholderTextColor={customColors.text}
          />

          <Text style={[styles.label, { color: customColors.text }]}>Gender</Text>
          <View style={styles.genderContainer}>
            <GenderButton title="Male" isSelected={gender === 'male'} />
            <GenderButton title="Female" isSelected={gender === 'female'} />
          </View>

          <Text style={[styles.label, { color: customColors.text }]}>Weight (kg)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.inputBackground,
              color: customColors.text,
              borderColor: customColors.border,
            }]}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Enter your weight"
            placeholderTextColor={customColors.text}
          />

          <Text style={[styles.label, { color: customColors.text }]}>Height (cm)</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: customColors.inputBackground,
              color: customColors.text,
              borderColor: customColors.border,
            }]}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholder="Enter your height"
            placeholderTextColor={customColors.text}
          />

          <Text style={[styles.label, { color: customColors.text }]}>Activity Level</Text>
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
            style={[styles.calculateButton, { backgroundColor: customColors.primary }]}
            onPress={calculateCalories}
          >
            <Text style={styles.calculateButtonText}>Calculate</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.4)' }]}> 
          <View style={[styles.modalContent, { backgroundColor: customColors.card }]}> 
            <Text style={[styles.modalTitle, { color: customColors.primary }]}>Calorie Recommendations</Text>
            {calorieResults && (
              <>
                <Text style={[styles.resultText, { color: customColors.text }]}>To Maintain: <Text style={{ color: customColors.primary }}>{calorieResults.maintain}</Text> kcal/day</Text>
                <Text style={[styles.resultText, { color: customColors.text }]}>To Lose Weight: <Text style={{ color: customColors.primary }}>{calorieResults.lose}</Text> kcal/day</Text>
                <Text style={[styles.resultText, { color: customColors.text }]}>To Gain Weight: <Text style={{ color: customColors.primary }}>{calorieResults.gain}</Text> kcal/day</Text>
              </>
            )}
            <TouchableOpacity style={[styles.closeButton, { backgroundColor: customColors.primary }]} onPress={() => setModalVisible(false)}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultText: {
    fontSize: 18,
    marginVertical: 6,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
});

export default CalorieCalculatorScreen; 