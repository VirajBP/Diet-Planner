import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Define colors locally since they're not in Colors.js
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
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PREMIUM_FEATURES = [
  {
    icon: 'water',
    title: 'Water Tracker',
    description: 'Track your daily water intake with custom glass sizes and detailed analytics',
  },
  {
    icon: 'scale',
    title: 'Weight Log',
    description: 'Monitor your weight progress with detailed graphs and history',
  },
  {
    icon: 'nutrition',
    title: 'Custom Ingredient Meal Search',
    description: 'Search for meals using your available ingredients',
  },
  {
    icon: 'restaurant',
    title: 'Access to Entire Meal Database',
    description: 'Get access to unlimited meal suggestions and more variety',
  },
];

const FREE_FEATURES = [
  {
    icon: 'home',
    title: 'Dashboard',
    description: 'Track your daily calories and meals',
  },
  {
    icon: 'calculator',
    title: 'Calorie Calculator',
    description: 'Calculate your daily calorie needs',
  },
  {
    icon: 'person',
    title: 'Profile',
    description: 'Manage your personal information and preferences',
  },
  {
    icon: 'restaurant',
    title: 'Meal Logging',
    description: 'Log and track your daily meals',
  },
  {
    icon: 'notifications',
    title: 'Custom Reminders',
    description: 'Set personalized reminders for meals and water intake',
  },
  {
    icon: 'search',
    title: 'Nutrition Search',
    description: 'Search and find nutritional information for foods',
  },
];

const PremiumScreen = () => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const customColors = isDark? FRESH_CALM_DARK:FRESH_CALM_LIGHT

  const handleGoPremium = async () => {
    Alert.alert(
      'Premium Coming Soon!',
      'Premium features will be available soon. Stay tuned for updates!',
      [{ text: 'OK' }]
    );
  };

  const renderFeature = (feature, isPremium = false) => (
    <View
      key={feature.title}
      style={[
        styles.featureItem,
        { borderColor: customColors.border }
      ]}
    >
      <View style={styles.featureIcon}>
        <Ionicons
          name={feature.icon}
          size={24}
          color={isPremium ? customColors.primary : customColors.text}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: customColors.text }]}>
          {feature.title}
        </Text>
        <Text style={[styles.featureDescription, { color: customColors.text }]}>
          {feature.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      {/* Header with Back Button */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: customColors.text }]}>
          Premium
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: customColors.text }]}>
            Upgrade to Premium
          </Text>
          <Text style={[styles.subtitle, { color: customColors.text }]}>
            Get access to all features and take your health journey to the next level
          </Text>
        </View>

        <Card style={styles.pricingCard}>
          <Text style={[styles.price, { color: customColors.primary }]}>$4.99</Text>
          <Text style={[styles.period, { color: customColors.text }]}>/month</Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: customColors.primary }]}
            onPress={handleGoPremium}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: customColors.text }]}>
            Premium Features
          </Text>
          {PREMIUM_FEATURES.map(feature => renderFeature(feature, true))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: customColors.text }]}>
            Free Features
          </Text>
          {FREE_FEATURES.map(feature => renderFeature(feature))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 32,
  },
  pricingCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  period: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 24,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
});

export default PremiumScreen; 