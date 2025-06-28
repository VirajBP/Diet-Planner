import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

const QUESTIONS = [
  'How do I log a meal?',
  'What are the benefits of Premium?',
  'How do I reset my password?',
  'How can I contact support?',
  'How do I calculate my calories or BMI?',
  'How do I track water intake?',
  'How do I log my weight?',
  'How do I set reminders?',
  'How do I update my profile?',
  'How do I view my meal history?',
  'How do I use the meal suggestions feature?',
  'How do I upgrade to premium?',
  'How do I use the chatbot?',
  'How do I log out?',
  'How do I delete my account?',
  'How do I change app theme?',
  'How do I get nutrition info for a meal?',
  'How do I use the water tracker?',
  'How do I use the weight log?',
  'How do I contact NutriPulse support?',
];

const RULES = [
  { keywords: ['log a meal'], response: "To log a meal, go to the Meals page and tap 'Add Meal'." },
  { keywords: ['benefits of premium', 'premium'], response: "Premium unlocks all features! Go to Settings > Premium to upgrade." },
  { keywords: ['reset my password', 'change password'], response: "You can update your password from the Settings > Account section." },
  { keywords: ['contact support'], response: "For support, email us at support@nutripulse.com." },
  { keywords: ['calories', 'bmi', 'calculate'], response: "Use the Calorie Calculator or BMI Calculator in the app for personalized info." },
  { keywords: ['water intake', 'track water'], response: "Track your water intake on the Water Tracker screen." },
  { keywords: ['log my weight', 'weight'], response: "Log your weight on the Weight Log screen to track your progress." },
  { keywords: ['set reminders'], response: "Go to the Reminders screen to set up meal, water, or weight reminders." },
  { keywords: ['update my profile'], response: "You can update your profile from the Settings > Account section." },
  { keywords: ['meal history'], response: "View your meal history on the Meals page." },
  { keywords: ['meal suggestions'], response: "Use the Meal Suggestions feature to get recommended meals based on your preferences." },
  { keywords: ['upgrade to premium'], response: "Go to Settings > Premium to upgrade and unlock all features." },
  { keywords: ['use the chatbot'], response: "You're using the chatbot right now! Tap a question below to get started." },
  { keywords: ['log out'], response: "You can log out from the Settings > Account section." },
  { keywords: ['delete my account'], response: "To delete your account, please contact support@nutripulse.com." },
  { keywords: ['change app theme'], response: "Go to Settings > Appearance to change the app theme." },
  { keywords: ['nutrition info'], response: "Use the Nutrition Search feature to get nutrition info for any meal." },
  { keywords: ['use the water tracker'], response: "Track your daily water intake on the Water Tracker screen." },
  { keywords: ['use the weight log'], response: "Log your weight and view progress on the Weight Log screen." },
  { keywords: ['contact nutripulse support'], response: "Email us at support@nutripulse.com for any help!" },
];

const DEFAULT_RESPONSE = "Sorry, I didn't understand that. Please try asking in a different way or contact support.";

const ChatbotScreen = () => {
  const { theme } = useTheme();
  const isDark = theme.dark;
  const customColors = isDark? FRESH_CALM_DARK: FRESH_CALM_LIGHT
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am NutriPulse Assistant. How can I help you today?' }
  ]);
  const chatListRef = useRef();

  const handleQuestion = (question) => {
    const userMessage = { from: 'user', text: question };
    const botMessage = { from: 'bot', text: getBotResponse(question) };
    setMessages(prev => [...prev, userMessage, botMessage]);
  };

  const getBotResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    for (const rule of RULES) {
      if (rule.keywords.some(keyword => lower.includes(keyword))) {
        return rule.response;
      }
    }
    return DEFAULT_RESPONSE;
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (chatListRef.current) {
      chatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.from === 'user' ? [styles.userMessage, { backgroundColor: customColors.primary }] : [styles.botMessage, { backgroundColor: customColors.card }]]}>
      <Text style={[styles.messageText, { color: customColors.text }]}>{item.text}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: customColors.background }]}> 
      <View style={[styles.header, { backgroundColor: customColors.card, borderBottomColor: customColors.border }]}> 
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={customColors.primary} />
        </TouchableOpacity>
        <Ionicons name="chatbubbles-outline" size={24} color={customColors.primary} style={{ marginRight: 8 }} />
        <Text style={[styles.headerText, { color: customColors.primary }]}>NutriPulse Chatbot</Text>
      </View>
      <FlatList
        ref={chatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={[styles.suggestionsContainer, { maxHeight: 220 }]}> {/* Reduced height */}
        <Text style={[styles.suggestionsTitle, { color: customColors.text }]}>Choose a question (Scroll for more):</Text>
        <ScrollView style={{ maxHeight: 180 }}>
          {QUESTIONS.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.suggestionButton, { backgroundColor: customColors.primary }]}
              onPress={() => handleQuestion(q)}
            >
              <Text style={[styles.suggestionText, { color: customColors.card }]}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  botMessage: {
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
  },
  suggestionsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  suggestionButton: {
    borderRadius: 22,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginBottom: 8,
    alignItems: 'center',
  },
  suggestionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ChatbotScreen; 