import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '../components/ui/Picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    age: '',
    gender: 'male',
    height: '',
    weight: '',
    targetWeight: '',
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryRestrictions: []
  });
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { signUp } = useAuth();
  const isDark = theme.dark;
  const customColors = isDark ? {
    primary: '#27AE60',
    card: '#1E1E1E',
    text: '#FAFAFA',
  } : {
    primary: '#2ECC71',
    card: '#FFFFFF',
    text: '#1C1C1C',
  };

  const activityLevels = [
    { label: 'Sedentary (Little/No Exercise)', value: 'sedentary' },
    { label: 'Light Activity (1-3 days/week)', value: 'light' },
    { label: 'Moderate Activity (3-5 days/week)', value: 'moderate' },
    { label: 'Very Active (6-7 days/week)', value: 'active' },
    { label: 'Extra Active (Physical Job/Training)', value: 'very_active' }
  ];

  const goals = [
    { label: 'Lose Weight', value: 'lose' },
    { label: 'Maintain Weight', value: 'maintain' },
    { label: 'Gain Weight', value: 'gain' }
  ];

  const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  const dietaryRestrictions = [
    { label: 'None', value: 'none' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten-free', value: 'gluten-free' },
    { label: 'Dairy-free', value: 'dairy-free' },
    { label: 'Nut-free', value: 'nut-free' },
    { label: 'Halal', value: 'halal' },
    { label: 'Kosher', value: 'kosher' }
  ];

  const handleInputChange = (field, value) => {
    if (field === 'dietaryRestrictions') {
      if (value.includes('none')) {
        setFormData(prev => ({ ...prev, [field]: ['none'] }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value.filter(v => v !== 'none')
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || 
        !formData.name || !formData.age || !formData.height || !formData.weight || !formData.targetWeight) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (isNaN(formData.age) || parseInt(formData.age) < 13 || parseInt(formData.age) > 120) {
      Alert.alert('Error', 'Please enter a valid age (13-120)');
      return false;
    }

    if (isNaN(formData.height) || parseInt(formData.height) < 100 || parseInt(formData.height) > 250) {
      Alert.alert('Error', 'Please enter a valid height in cm (100-250)');
      return false;
    }

    if (isNaN(formData.weight) || parseInt(formData.weight) < 30 || parseInt(formData.weight) > 300) {
      Alert.alert('Error', 'Please enter a valid weight in kg (30-300)');
      return false;
    }

    if (isNaN(formData.targetWeight) || parseInt(formData.targetWeight) < 30 || parseInt(formData.targetWeight) > 300) {
      Alert.alert('Error', 'Please enter a valid target weight in kg (30-300)');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      const userData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        profile: {
          name: formData.name.trim(),
          age: parseInt(formData.age),
          gender: formData.gender.toLowerCase(),
          height: parseInt(formData.height),
          weight: parseInt(formData.weight),
          targetWeight: parseInt(formData.targetWeight),
          activityLevel: formData.activityLevel.toLowerCase(),
          goal: formData.goal,
          dietaryRestrictions: formData.dietaryRestrictions.filter(r => r !== 'none')
        }
      };

      await signUp(userData);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (placeholder, field, keyboardType = 'default', secureTextEntry = false) => (
    <TextInput
      style={[styles.input, { 
        backgroundColor: customColors.card,
        color: customColors.text,
        borderColor: customColors.border
      }]}
      placeholder={placeholder}
      placeholderTextColor={customColors.text}
      value={formData[field]}
      onChangeText={(value) => handleInputChange(field, value)}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      autoCapitalize={field === 'email' ? 'none' : 'words'}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.card }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView}>
          <View style={styles.content}>
            <Image
              source={require('../assets/logo.png')}
              style={[styles.logo, { tintColor: customColors.text }]}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: customColors.text }]}>Create Account</Text>
            
            {renderInput('Email', 'email', 'email-address')}
            {renderInput('Password', 'password', 'default', true)}
            {renderInput('Confirm Password', 'confirmPassword', 'default', true)}
            {renderInput('Full Name', 'name')}
            {renderInput('Age', 'age', 'numeric')}
            {renderInput('Height (cm)', 'height', 'numeric')}
            {renderInput('Current Weight (kg)', 'weight', 'numeric')}
            {renderInput('Target Weight (kg)', 'targetWeight', 'numeric')}

            <View style={styles.pickerContainer}>
              <Text style={[styles.label, { color: customColors.text }]}>Gender</Text>
              <Picker
                selectedValue={formData.gender}
                onValueChange={(value) => handleInputChange('gender', value)}
                items={genders}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={[styles.label, { color: customColors.text }]}>Activity Level</Text>
              <Picker
                selectedValue={formData.activityLevel}
                onValueChange={(value) => handleInputChange('activityLevel', value)}
                items={activityLevels}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={[styles.label, { color: customColors.text }]}>Goal</Text>
              <Picker
                selectedValue={formData.goal}
                onValueChange={(value) => handleInputChange('goal', value)}
                items={goals}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Text style={[styles.label, { color: customColors.text }]}>Dietary Restrictions</Text>
              <Picker
                selectedValue={formData.dietaryRestrictions}
                onValueChange={(value) => handleInputChange('dietaryRestrictions', value)}
                items={dietaryRestrictions}
                multiple={true}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: customColors.primary }]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.linkText, { color: customColors.primary }]}>
                Already have an account? Login
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    marginBottom: 30,
  },
  linkText: {
    fontSize: 14,
  },
});

export default RegisterScreen; 