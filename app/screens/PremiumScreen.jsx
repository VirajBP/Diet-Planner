import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const PREMIUM_FEATURES = [
  {
    icon: 'water',
    title: 'Water Tracker',
    description: 'Track your daily water intake and stay hydrated',
  },
  {
    icon: 'scale',
    title: 'Weight Log',
    description: 'Monitor your weight progress with detailed graphs',
  },
  {
    icon: 'cart',
    title: 'Grocery Planner',
    description: 'Plan your groceries based on your meal plans',
  },
  {
    icon: 'nutrition',
    title: 'AI Meal Suggestions',
    description: 'Get personalized meal suggestions based on your goals',
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
];

const PremiumScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const handleGoPremium = async () => {
    try {
      // 1. Call backend to create order (amount in rupees)
      const amount = 499; // Example: 499 INR for premium
      const orderRes = await mongodbService.api.post('/payments/create-order', { amount });
      const order = orderRes.data;
      // 2. Open Razorpay checkout
      const options = {
        description: 'NutriPulse Premium Subscription',
        currency: 'INR',
        key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID, // Use test key
        amount: order.amount, // in paise
        order_id: order.id,
        name: 'NutriPulse',
        prefill: {
          email: user?.email || '',
          contact: user?.profile?.phone || '',
          name: user?.profile?.name || '',
        },
        theme: { color: '#2ECC71' },
      };
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Payment Success
          Alert.alert('Success', 'Payment successful! You are now a premium user.');
          // Optionally, refresh user profile or navigate
        })
        .catch((error) => {
          // Payment Failed or Cancelled
          Alert.alert('Payment Failed', error.description || 'Payment was not completed.');
        });
    } catch (error) {
      Alert.alert('Error', error.message || 'Could not initiate payment.');
    }
  };

  const renderFeature = (feature, isPremium = false) => (
    <View
      key={feature.title}
      style={[
        styles.featureItem,
        { borderColor: theme.colors.border }
      ]}
    >
      <View style={styles.featureIcon}>
        <Ionicons
          name={feature.icon}
          size={24}
          color={isPremium ? theme.colors.primary : theme.colors.text}
        />
      </View>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
          {feature.title}
        </Text>
        <Text style={[styles.featureDescription, { color: theme.colors.text }]}>
          {feature.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Upgrade to Premium
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>
            Get access to all features and take your health journey to the next level
          </Text>
        </View>

        <Card style={styles.pricingCard}>
          <Text style={[styles.price, { color: theme.colors.primary }]}>$4.99</Text>
          <Text style={[styles.period, { color: theme.colors.text }]}>/month</Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleGoPremium}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </Card>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Premium Features
          </Text>
          {PREMIUM_FEATURES.map(feature => renderFeature(feature, true))}
        </View>

        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
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