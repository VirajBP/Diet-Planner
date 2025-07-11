import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';
import reminderService from '../services/reminderService';

// Fresh & Calm (Mint Theme)
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

const RemindersScreen = () => {
  const { theme, isDark } = useTheme();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    type: 'meal',
    title: '',
    message: '',
    time: '08:00',
    mealType: 'breakfast',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    enabled: true
  });
  const navigation = useNavigation();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);

  useEffect(() => {
    loadReminders();
    initializeReminderService();
  }, []);

  const initializeReminderService = async () => {
    try {
      const initialized = await reminderService.initialize();
      if (!initialized) {
        Alert.alert('Permission Required', 'Please enable notifications to use reminders.');
      }
    } catch (error) {
      console.error('Error initializing reminder service:', error);
    }
  };

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await mongodbService.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Load reminders error:', error);
      Alert.alert('Error', 'Failed to load reminders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReminder = async () => {
    if (!formData.title.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    try {
      let savedReminder;
      if (editingReminder) {
        savedReminder = await mongodbService.updateReminder(editingReminder._id, formData);
        // Update local notification
        await reminderService.updateReminder(savedReminder);
      } else {
        savedReminder = await mongodbService.createReminder(formData);
        // Schedule local notification
        await reminderService.scheduleReminder(savedReminder);
      }
      
      setShowModal(false);
      setEditingReminder(null);
      resetForm();
      loadReminders();
      Alert.alert('Success', editingReminder ? 'Reminder updated successfully' : 'Reminder created successfully');
    } catch (error) {
      console.error('Save reminder error:', error);
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await mongodbService.deleteReminder(reminderId);
              // Cancel local notification
              await reminderService.cancelReminder(reminderId);
              loadReminders();
              Alert.alert('Success', 'Reminder deleted successfully');
            } catch (error) {
              console.error('Delete reminder error:', error);
              Alert.alert('Error', 'Failed to delete reminder. Please try again.');
            }
          }
        }
      ]
    );
  };

  const toggleReminder = async (reminder) => {
    try {
      const updatedReminder = await mongodbService.toggleReminder(reminder._id);
      
      if (updatedReminder.isActive) {
        // Schedule notification
        await reminderService.scheduleReminder(updatedReminder);
      } else {
        // Cancel notification
        await reminderService.cancelReminder(reminder._id);
      }
      
      loadReminders();
    } catch (error) {
      console.error('Toggle reminder error:', error);
      Alert.alert('Error', 'Failed to toggle reminder. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'meal',
      title: '',
      message: '',
      time: '08:00',
      mealType: 'breakfast',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      enabled: true
    });
  };

  const openEditModal = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      title: reminder.title,
      message: reminder.message,
      time: reminder.time,
      mealType: reminder.mealType || 'breakfast',
      days: reminder.days,
      enabled: reminder.isActive
    });
    setShowModal(true);
  };

  const testNotification = async () => {
    try {
      await reminderService.sendTestNotification();
      Alert.alert('Success', 'Test notification sent! Check your device in 5 seconds.');
    } catch (error) {
      console.error('Test notification error:', error);
      Alert.alert('Error', 'Failed to send test notification. Please check notification permissions.');
    }
  };

  const handleConfirmTime = (date) => {
    // Format to HH:MM (24-hour)
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    setFormData({ ...formData, time: `${hours}:${minutes}` });
    setTimePickerVisible(false);
  };

  const renderReminderItem = ({ item }) => (
    <View style={[styles.reminderCard, { backgroundColor: customColors.card }]}>
      <View style={styles.reminderHeader}>
        <View style={styles.reminderInfo}>
          <Text style={[styles.reminderTitle, { color: customColors.text }]}>
            {item.title}
          </Text>
          <Text style={[styles.reminderMessage, { color: customColors.text + '80' }]}>
            {item.message}
          </Text>
          <View style={styles.reminderMeta}>
            <View style={[styles.timeBadge, { backgroundColor: customColors.primary }]}>
              <Ionicons name="time" size={12} color="white" />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            {item.type === 'meal' && (
              <View style={[styles.typeBadge, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.typeText}>{item.mealType}</Text>
              </View>
            )}
            <View style={[styles.typeBadge, { backgroundColor: '#FF9800' }]}>
              <Text style={styles.typeText}>{item.type}</Text>
            </View>
          </View>
        </View>
        <View style={styles.reminderActions}>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleReminder(item)}
            trackColor={{ false: '#767577', true: customColors.primary }}
            thumbColor={item.isActive ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>
      </View>
      
      <View style={styles.reminderFooter}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openEditModal(item)}
        >
          <Ionicons name="pencil" size={16} color={customColors.primary} />
          <Text style={[styles.actionText, { color: customColors.primary }]}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteReminder(item._id)}
        >
          <Ionicons name="trash" size={16} color={customColors.error} />
          <Text style={[styles.actionText, { color: customColors.error }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowModal(false);
        setEditingReminder(null);
        resetForm();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: customColors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: customColors.text }]}>
              {editingReminder ? 'Edit Reminder' : 'Add Reminder'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setEditingReminder(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={customColors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: customColors.text }]}>Type</Text>
              <View style={styles.typeSelector}>
                {['meal', 'water', 'exercise', 'weight'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && { backgroundColor: customColors.primary }
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={[
                      styles.typeOptionText,
                      { color: formData.type === type ? 'white' : customColors.text }
                    ]}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.type === 'meal' && (
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: customColors.text }]}>Meal Type</Text>
                <View style={styles.typeSelector}>
                  {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                    <TouchableOpacity
                      key={mealType}
                      style={[
                        styles.typeOption,
                        formData.mealType === mealType && { backgroundColor: customColors.primary }
                      ]}
                      onPress={() => setFormData({ ...formData, mealType })}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        { color: formData.mealType === mealType ? 'white' : theme.colors.text }
                      ]}>
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Title</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Reminder title"
                placeholderTextColor={theme.colors.text + '60'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Message</Text>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text,
                  borderColor: theme.colors.border
                }]}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder="Reminder message"
                placeholderTextColor={theme.colors.text + '60'}
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Time</Text>
              <TouchableOpacity
                style={[styles.textInput, { justifyContent: 'center', backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
                onPress={() => setTimePickerVisible(true)}
              >
                <Text style={{ color: theme.colors.text, fontSize: 16 }}>{formData.time || 'Select Time'}</Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                date={formData.time ? new Date(`1970-01-01T${formData.time}:00`) : new Date()}
                onConfirm={handleConfirmTime}
                onCancel={() => setTimePickerVisible(false)}
                is24Hour={true}
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.border }]}
              onPress={() => {
                setShowModal(false);
                setEditingReminder(null);
                resetForm();
              }}
            >
              <Text style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: customColors.primary }]}
              onPress={handleSaveReminder}
            >
              <Text style={[styles.buttonText, { color: 'white' }]}>
                {editingReminder ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16 , flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Reminders</Text>
        </TouchableOpacity>
        
        <View style={styles.headerButtons}>
          {/* <TouchableOpacity
            style={[styles.testButton, { backgroundColor: theme.colors.card }]}
            onPress={testNotification}
          >
            <Ionicons name="notifications" size={20} color={customColors.primary} />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: customColors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={reminders}
        renderItem={renderReminderItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-outline" size={48} color={theme.colors.text + '40'} />
              <Text style={[styles.emptyText, { color: theme.colors.text + '60' }]}>
                No reminders set yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text + '40' }]}>
                Tap the + button to add your first reminder
              </Text>
            </View>
          ) : null
        }
      />

      {renderModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
  },
  reminderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  reminderMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  reminderActions: {
    marginLeft: 12,
  },
  reminderFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textInput: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  testButton: {
    padding: 8,
    borderRadius: 8,
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
  },
});

export default RemindersScreen;
