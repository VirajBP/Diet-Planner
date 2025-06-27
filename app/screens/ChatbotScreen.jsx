import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RULES = [
  {
    keywords: ['log meal', 'add meal', 'record meal'],
    response: "To log a meal, go to the Meals page and tap 'Add Meal'."
  },
  {
    keywords: ['premium', 'upgrade'],
    response: "Premium unlocks all features! Go to Settings > Premium to upgrade."
  },
  {
    keywords: ['reset password', 'change password'],
    response: "You can update your password from the Settings > Account section."
  },
  {
    keywords: ['contact', 'support', 'help'],
    response: "For support, email us at support@nutripulse.com."
  },
  {
    keywords: ['calorie', 'bmi', 'calculate'],
    response: "Use the Calorie Calculator or BMI Calculator in the app for personalized info."
  },
  {
    keywords: ['water', 'track water'],
    response: "Track your water intake on the Water Tracker screen."
  },
  {
    keywords: ['weight', 'log weight'],
    response: "Log your weight on the Weight Log screen to track your progress."
  },
  // Add more rules as needed
];

const DEFAULT_RESPONSE = "Sorry, I didn't understand that. Please try asking in a different way or contact support.";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! I am NutriPulse Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const flatListRef = useRef();

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { from: 'user', text: input.trim() };
    const botMessage = { from: 'bot', text: getBotResponse(input.trim()) };
    setMessages(prev => [...prev, userMessage, botMessage]);
    setInput('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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

  const renderItem = ({ item }) => (
    <View style={[styles.messageContainer, item.from === 'user' ? styles.userMessage : styles.botMessage]}>
      <Text style={styles.messageText}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={24} color="#2ECC71" style={{ marginRight: 8 }} />
        <Text style={styles.headerText}>NutriPulse Chatbot</Text>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(_, idx) => idx.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFEFE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#A3E4D7',
    backgroundColor: '#FFFFFF',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ECC71',
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
    backgroundColor: '#2ECC71',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5F8EF',
  },
  messageText: {
    color: '#1C1C1C',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#A3E4D7',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2ECC71',
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatbotScreen; 