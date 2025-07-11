import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

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

export default function PrivacyPolicyScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  return (
    <View style={[styles.container, { backgroundColor: customColors.background }]}> 
      <View style={[styles.header, { marginTop: 24, backgroundColor: customColors.surface, borderBottomColor: customColors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: customColors.text }]}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <Text style={[styles.sectionHeader, { color: customColors.primary }]}>1. Introduction</Text>
        <Text style={[styles.paragraph, { color: customColors.text }]}>We value your privacy. This policy explains how we collect, use, and protect your information.</Text>
        <Text style={[styles.sectionHeader, { color: customColors.primary }]}>2. Data Collection</Text>
        <Text style={[styles.paragraph, { color: customColors.text }]}>We collect information you provide, such as your profile details, preferences, and meal logs. We do not sell your data to third parties.</Text>
        <Text style={[styles.sectionHeader, { color: customColors.primary }]}>3. Data Usage</Text>
        <Text style={[styles.paragraph, { color: customColors.text }]}>Your data is used to personalize your experience, generate meal suggestions, and improve our services.</Text>
        <Text style={[styles.sectionHeader, { color: customColors.primary }]}>4. Security</Text>
        <Text style={[styles.paragraph, { color: customColors.text }]}>We implement security measures to protect your data. However, no method is 100% secure.</Text>
        <Text style={[styles.sectionHeader, { color: customColors.primary }]}>5. Contact</Text>
        <Text style={[styles.paragraph, { color: customColors.text }]}>For questions about this policy, contact us via the app's support section.</Text>
      </ScrollView>
    </View>
  );
}

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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 18,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
  },
}); 