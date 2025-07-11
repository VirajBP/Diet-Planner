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

const FAQ_SECTIONS = [
  {
    header: 'Getting Started',
    faqs: [
      {
        question: 'How do I use the Diet Planner app?',
        answer: 'Start by creating your profile, then explore meal suggestions and track your progress!'
      },
      {
        question: 'How do I edit my profile?',
        answer: 'Go to Settings > Account > Edit Profile to update your details.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Go to Settings > Account > Change Password.'
      },
    ]
  },
  {
    header: 'Features',
    faqs: [
      {
        question: 'How are meal suggestions generated?',
        answer: 'Meal suggestions are tailored to your profile, dietary preferences, and goals.'
      },
      {
        question: 'What is a meal package?',
        answer: 'A meal package is a set of meals for the day, optimized for your calorie and nutrition needs.'
      },
      {
        question: 'How do I log my water intake?',
        answer: 'Go to the Water tab and tap the plus button to log your water intake.'
      },
      {
        question: 'How do I track my weight?',
        answer: 'Go to the Weight Log screen from the Profile tab.'
      },
    ]
  },
  {
    header: 'Account & Privacy',
    faqs: [
      {
        question: 'Is my data private?',
        answer: 'Yes, your data is stored securely and is never sold to third parties.'
      },
      {
        question: 'How do I delete my account?',
        answer: 'Contact support via the Contact Us screen to request account deletion.'
      },
      {
        question: 'How do I access the Privacy Policy?',
        answer: 'Go to Settings > Support > Privacy Policy.'
      },
    ]
  },
  {
    header: 'Premium',
    faqs: [
      {
        question: 'What are premium features?',
        answer: 'Premium features include advanced meal suggestions, custom meal packages, and more.'
      },
      {
        question: 'How do I upgrade to premium?',
        answer: 'Go to Settings > Account > Premium Features.'
      },
    ]
  },
  {
    header: 'Troubleshooting',
    faqs: [
      {
        question: 'I am not receiving notifications. What should I do?',
        answer: 'Check your device notification settings and ensure notifications are enabled for Diet Planner.'
      },
      {
        question: 'The app is not syncing. How can I fix this?',
        answer: 'Try restarting the app or checking your internet connection.'
      },
      {
        question: 'How do I contact support?',
        answer: 'You can contact us via the Contact Us screen in the app.'
      },
    ]
  },
];

export default function HelpCenterScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  return (
    <View style={[styles.container, { backgroundColor: customColors.background }]}> 
      <View style={[styles.header, { marginTop: 24, backgroundColor: customColors.surface, borderBottomColor: customColors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: customColors.text }]}>Help Center</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {FAQ_SECTIONS.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionBlock}>
            <Text style={[styles.sectionHeader, { color: customColors.primary }]}>{section.header}</Text>
            {section.faqs.map((faq, idx) => (
              <View key={idx} style={[styles.faqCard, { backgroundColor: customColors.card, borderColor: customColors.border }]}> 
                <Text style={[styles.question, { color: customColors.primary }]}>{faq.question}</Text>
                <Text style={[styles.answer, { color: customColors.text }]}>{faq.answer}</Text>
              </View>
            ))}
          </View>
        ))}
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
  sectionBlock: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 8,
  },
  faqCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  answer: {
    fontSize: 15,
    marginBottom: 2,
  },
}); 