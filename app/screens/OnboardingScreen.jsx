import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Button from '../components/ui/Button';
import { useOnboarding } from '../context/OnboardingContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

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

const steps = [
  {
    title: 'Welcome to Smart Diet Planner',
    description: 'Your personal nutrition assistant to help you achieve your health goals.',
    image: require('../assets/welcome.jpg'),
  },
  {
    title: 'Track Your Meals',
    description: 'Easily log your meals and track your daily nutrition intake.',
    image: require('../assets/meals.webp'),
  },
  {
    title: 'Set Your Goals',
    description: 'Customize your diet plan based on your personal goals and preferences.',
    image: require('../assets/calories.jpg'),
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { completeOnboarding } = useOnboarding();
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
      // Navigation will happen automatically based on onboarding state
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    // Navigation will happen automatically based on onboarding state
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.card }]}>
      <LinearGradient
        colors={isDark ? ['#1a1a1a', '#2d2d2d'] : ['#FFFFFF', '#FDFEFE']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={steps[currentStep].image}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: customColors.text }]}>{steps[currentStep].title}</Text>
          <Text style={[styles.description, { color: isDark ? '#CCCCCC' : '#666' }]}>{steps[currentStep].description}</Text>
        </View>

        <View style={styles.indicators}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                { backgroundColor: index === currentStep ? customColors.primary : (isDark ? '#4A4A4A' : '#E0E0E0'), width: index === currentStep ? 20 : 8 },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <Button
              title="Previous"
              onPress={handlePrevious}
              type="secondary"
              style={[styles.button, { backgroundColor: isDark ? '#222' : '#eee', borderColor: customColors.primary, borderWidth: 1 }]}
              textStyle={{ color: customColors.primary }}
            />
          )}
          <Button
            title={currentStep === steps.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            style={[styles.button, { backgroundColor: customColors.primary }]}
            textStyle={{ color: isDark ? '#000' : '#fff' }}
          />
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={[styles.skipText, { color: customColors.primary }]}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    marginBottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  indicators: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 10,
  },
  button: {
    flex: 1,
    maxWidth: 200,
  },
  skipButton: {
    marginTop: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OnboardingScreen; 