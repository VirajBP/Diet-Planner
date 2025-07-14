import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FeedbackScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: user?.email || '',
    subject: '',
    message: '',
    category: 'general',
    rating: null,
    isAnonymous: false
  });

  const [errors, setErrors] = useState({});

  const categories = [
    { label: 'General Feedback', value: 'general' },
    { label: 'Bug Report', value: 'bug' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'Complaint', value: 'complaint' },
    { label: 'Praise', value: 'praise' }
  ];

  const ratings = [
    { label: '1 - Poor', value: 1 },
    { label: '2 - Fair', value: 2 },
    { label: '3 - Good', value: 3 },
    { label: '4 - Very Good', value: 4 },
    { label: '5 - Excellent', value: 5 }
  ];

  useEffect(() => {
    loadFeedbackHistory();
  }, []);

  const loadFeedbackHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/feedback`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setFeedbackHistory(data);
      }
    } catch (error) {
      console.error('Error loading feedback history:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.length > 200) {
      newErrors.subject = 'Subject must be less than 200 characters';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.length > 2000) {
      newErrors.message = 'Message must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!',
          'Thank you for your feedback. We appreciate your input!',
          [
            {
              text: 'OK',
              onPress: () => {
                setFormData({
                  email: user?.email || '',
                  subject: '',
                  message: '',
                  category: 'general',
                  rating: null,
                  isAnonymous: false
                });
                setErrors({});
                loadFeedbackHistory();
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'in-progress': return '#007AFF';
      case 'resolved': return '#34C759';
      case 'closed': return '#8E8E93';
      default: return '#8E8E93';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'bug': return 'bug-outline';
      case 'feature': return 'add-circle-outline';
      case 'complaint': return 'alert-circle-outline';
      case 'praise': return 'heart-outline';
      default: return 'chatbubble-outline';
    }
  };

  const renderFeedbackHistory = () => {
    if (loading) {
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading feedback history...</Text>
        </View>
      );
    }

    if (feedbackHistory.length === 0) {
      return (
        <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="chatbubble-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No feedback submitted yet
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.historyContainer}>
        {feedbackHistory.map((feedback) => (
          <View key={feedback._id} style={[styles.feedbackCard, { backgroundColor: colors.card }]}>
            <View style={styles.feedbackHeader}>
              <View style={styles.feedbackMeta}>
                <Ionicons 
                  name={getCategoryIcon(feedback.category)} 
                  size={20} 
                  color={colors.primary} 
                />
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {categories.find(cat => cat.value === feedback.category)?.label}
                </Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(feedback.status) }]}>
                  <Text style={styles.statusText}>{feedback.status}</Text>
                </View>
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {new Date(feedback.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={[styles.subjectText, { color: colors.text }]}>
              {feedback.subject}
            </Text>
            
            <Text style={[styles.messageText, { color: colors.textSecondary }]} numberOfLines={3}>
              {feedback.message}
            </Text>

            {feedback.rating && (
              <View style={styles.ratingContainer}>
                <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rating: </Text>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= feedback.rating ? 'star' : 'star-outline'}
                      size={16}
                      color={star <= feedback.rating ? '#FFD700' : colors.textSecondary}
                    />
                  ))}
                </View>
              </View>
            )}

            {feedback.adminResponse && (
              <View style={[styles.adminResponse, { backgroundColor: colors.background }]}>
                <Text style={[styles.adminResponseLabel, { color: colors.primary }]}>
                  Admin Response:
                </Text>
                <Text style={[styles.adminResponseText, { color: colors.text }]}>
                  {feedback.adminResponse}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderFeedbackForm = () => (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.formContainer}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.formCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Submit Feedback</Text>
          
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.email ? '#FF3B30' : colors.border
                }
              ]}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          {/* Subject */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Subject *</Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.subject ? '#FF3B30' : colors.border
                }
              ]}
              value={formData.subject}
              onChangeText={(text) => setFormData({ ...formData, subject: text })}
              placeholder="Brief description of your feedback"
              placeholderTextColor={colors.textSecondary}
              maxLength={200}
            />
            {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Picker
                selectedValue={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
                style={[styles.picker, { color: colors.text }]}
              >
                {categories.map((category) => (
                  <Picker.Item
                    key={category.value}
                    label={category.label}
                    value={category.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Rating (Optional)</Text>
            <View style={styles.ratingInputContainer}>
              {ratings.map((rating) => (
                <TouchableOpacity
                  key={rating.value}
                  style={[
                    styles.ratingButton,
                    { 
                      backgroundColor: formData.rating === rating.value ? colors.primary : colors.background,
                      borderColor: colors.border
                    }
                  ]}
                  onPress={() => setFormData({ ...formData, rating: rating.value })}
                >
                  <Text style={[
                    styles.ratingButtonText,
                    { color: formData.rating === rating.value ? '#FFFFFF' : colors.text }
                  ]}>
                    {rating.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Message */}
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>Message *</Text>
            <TextInput
              style={[
                styles.textArea,
                { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: errors.message ? '#FF3B30' : colors.border
                }
              ]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholder="Please provide detailed feedback..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
            {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>
              {formData.message.length}/2000 characters
            </Text>
          </View>

          {/* Anonymous Option */}
          <TouchableOpacity
            style={styles.anonymousContainer}
            onPress={() => setFormData({ ...formData, isAnonymous: !formData.isAnonymous })}
          >
            <Ionicons
              name={formData.isAnonymous ? 'checkbox' : 'square-outline'}
              size={24}
              color={formData.isAnonymous ? colors.primary : colors.textSecondary}
            />
            <Text style={[styles.anonymousText, { color: colors.text }]}>
              Submit anonymously
            </Text>
          </TouchableOpacity>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              { 
                backgroundColor: submitting ? colors.textSecondary : colors.primary,
                opacity: submitting ? 0.7 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Feedback</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Feedback</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => setShowHistory(!showHistory)}
        >
          <Ionicons 
            name={showHistory ? "create-outline" : "time-outline"} 
            size={24} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {showHistory ? renderFeedbackHistory() : renderFeedbackForm()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
    fontWeight: '600',
  },
  historyButton: {
    padding: 8,
  },
  formContainer: {
    flex: 1,
  },
  formCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 120,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  ratingInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  ratingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  anonymousContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  anonymousText: {
    fontSize: 16,
    marginLeft: 8,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
  },
  historyContainer: {
    flex: 1,
    padding: 16,
  },
  feedbackCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 12,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  ratingLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  stars: {
    flexDirection: 'row',
  },
  adminResponse: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  adminResponseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  adminResponseText: {
    fontSize: 14,
    lineHeight: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default FeedbackScreen; 