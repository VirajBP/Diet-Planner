import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { API_URL } from '../config/config';
import { useAuth } from '../context/AuthContext';
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

const NUTRITION_QUESTIONS = [
  'What should I eat for breakfast?',
  'How many calories should I eat daily?',
  'What are good protein sources?',
  'How to lose weight safely?',
  'What foods help with energy?',
  'How much water should I drink?',
  'What are healthy snacks?',
  'How to build muscle?',
  'What is a balanced diet?',
  'Foods to avoid for weight loss?',
  'How to improve digestion?',
  'What vitamins do I need?',
  'How to meal prep?',
  'Best foods for heart health?',
  'How to read nutrition labels?',
  'What is intermittent fasting?',
  'How to eat more vegetables?',
  'What are superfoods?',
  'How to reduce sugar intake?',
  'What is the keto diet?',
];

const DEFAULT_RESPONSE = "I'm sorry, but I can only help with nutrition and diet-related questions. Please ask me about food, nutrition, health, or diet topics.";

const ChatbotScreen = () => {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();
  const customColors = isDark? FRESH_CALM_DARK: FRESH_CALM_LIGHT
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am NutriPulse, your nutrition assistant. I can help you with diet, nutrition, and health questions. What would you like to know?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatListRef = useRef();

  const sendMessage = async (message) => {
    if (!message.trim()) return;

    if (!user || !user.token) {
      alert('You are not logged in. Please log in again.');
      setIsLoading(false);
      return;
    }

    const userMessage = { from: 'user', text: message };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Log the token for debugging
    console.log('[Chatbot] Sending token:', user?.token);

    try {
      const response = await fetch(`${API_URL}/chatbot/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({ message }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Non-JSON response from backend:', text);
        throw new Error(`Non-JSON response: ${text.slice(0, 100)}`);
      }

      const botMessage = { 
        from: 'bot', 
        text: data.success ? data.message : (data.message || DEFAULT_RESPONSE)
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const botMessage = { 
        from: 'bot', 
        text: 'Sorry, I\'m having trouble connecting. Please try again.' 
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestion = (question) => {
    sendMessage(question);
  };

  useEffect(() => {
    // Auto-scroll to bottom when messages change
    if (chatListRef.current) {
      chatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.from === 'user' ? [styles.userMessage, { backgroundColor: customColors.primary }] : [styles.botMessage, { backgroundColor: customColors.card }]]}>
      <Text style={[styles.messageText, { color: item.from === 'user' ? customColors.card : customColors.text }]}>{item.text}</Text>
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
      {/* Input Section */}
      <View style={[styles.inputContainer, { backgroundColor: customColors.card, borderTopColor: customColors.border }]}>
        <TextInput
          style={[styles.textInput, { 
            backgroundColor: customColors.surface, 
            color: customColors.text,
            borderColor: customColors.border 
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me about nutrition..."
          placeholderTextColor={customColors.text + '80'}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, { 
            backgroundColor: inputText.trim() ? customColors.primary : customColors.border 
          }]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={customColors.card} />
          ) : (
            <Ionicons name="send" size={20} color={customColors.card} />
          )}
        </TouchableOpacity>
      </View>

      {/* Suggestions Section */}
      <View style={[styles.suggestionsContainer, { maxHeight: 200 }]}>
        <Text style={[styles.suggestionsTitle, { color: customColors.text }]}>Quick nutrition questions:</Text>
        <ScrollView style={{ maxHeight: 160 }} horizontal showsHorizontalScrollIndicator={false}>
          {NUTRITION_QUESTIONS.map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.suggestionButton, { backgroundColor: customColors.primary, marginRight: 8 }]}
              onPress={() => handleQuestion(q)}
              disabled={isLoading}
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
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen; 