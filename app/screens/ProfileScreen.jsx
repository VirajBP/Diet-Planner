import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Dimensions, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '../components/ui/Picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

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

const ProfileScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const { user, signOut, updateUserProfile } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const activityLevels = [
    { label: 'Sedentary', value: 'sedentary' },
    { label: 'Light Activity', value: 'light' },
    { label: 'Moderate Activity', value: 'moderate' },
    { label: 'Active', value: 'active' },
    { label: 'Very Active', value: 'very_active' }
  ];

  const goals = [
    { label: 'Lose Weight', value: 'lose' },
    { label: 'Maintain Weight', value: 'maintain' },
    { label: 'Gain Weight', value: 'gain' }
  ];

  const genders = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' }
  ];

  const handleLogout = async () => {
    try {
      console.log('Attempting to logout...');
      await signOut();
      console.log('Successfully logged out');
      // Navigation will happen automatically based on authentication state
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleEditPress = () => {
    setEditingProfile({
      name: user?.profile?.name || '',
      age: user?.profile?.age?.toString() || '',
      gender: user?.profile?.gender || 'male',
      height: user?.profile?.height?.toString() || '',
      weight: user?.profile?.weight?.toString() || '',
      targetWeight: user?.profile?.targetWeight?.toString() || '',
      activityLevel: user?.profile?.activityLevel || 'moderate',
      goal: user?.profile?.goal || 'maintain'
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Validate the data
      if (!editingProfile.name || !editingProfile.age || !editingProfile.height || 
          !editingProfile.weight || !editingProfile.targetWeight) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate numeric fields
      const age = parseInt(editingProfile.age);
      const height = parseInt(editingProfile.height);
      const weight = parseInt(editingProfile.weight);
      const targetWeight = parseInt(editingProfile.targetWeight);

      if (isNaN(age) || age < 13 || age > 120) {
        Alert.alert('Error', 'Please enter a valid age between 13 and 120');
        return;
      }

      if (isNaN(height) || height < 100 || height > 250) {
        Alert.alert('Error', 'Please enter a valid height between 100 and 250 cm');
        return;
      }

      if (isNaN(weight) || weight < 30 || weight > 300) {
        Alert.alert('Error', 'Please enter a valid weight between 30 and 300 kg');
        return;
      }

      if (isNaN(targetWeight) || targetWeight < 30 || targetWeight > 300) {
        Alert.alert('Error', 'Please enter a valid target weight between 30 and 300 kg');
        return;
      }

      // Structure the profile data to match the User model
      const updatedProfile = {
        name: editingProfile.name.trim(),
        age: age,
        gender: editingProfile.gender,
        height: height,
        weight: weight,
        targetWeight: targetWeight,
        activityLevel: editingProfile.activityLevel,
        goal: editingProfile.goal,
        // Preserve existing stats
        stats: user?.profile?.stats || {
          totalCaloriesBurned: 0,
          totalWorkouts: 0,
          streakDays: 0,
          weightLogs: [],
          lastWorkout: null
        }
      };

      console.log('Sending profile update:', updatedProfile);
      const updatedUser = await updateUserProfile(updatedProfile);
      setEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (value, unit = '') => {
    if (value === undefined || value === null || value === '') return 'Not set';
    return `${value}${unit}`;
  };

  const formatActivityLevel = (level) => {
    if (!level) return 'Not set';
    return level.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatGoal = (goal) => {
    if (!goal) return 'Not set';
    return goal.charAt(0).toUpperCase() + goal.slice(1) + ' Weight';
  };

  // Helper to robustly format the user's createdAt date
  const formatMemberSince = (createdAt) => {
    console.log('This is the createdAt data: ', createdAt);
    if (!createdAt) return 'Not set';
    if (typeof createdAt === 'string' && createdAt.length >= 10 && createdAt[4] === '-' && createdAt[7] === '-') {
      // ISO string, return YYYY-MM-DD
      return createdAt.slice(0, 10);
    }
    let dateObj;
    if (typeof createdAt === 'number') {
      dateObj = new Date(createdAt);
    } else {
      dateObj = new Date(createdAt);
    }
    if (isNaN(dateObj.getTime())) return 'Not set';
    return dateObj.toLocaleDateString();
  };

  const renderSection = (title, fields) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: customColors.text }]}>{title}</Text>
      {fields.map(({ label, value }) => (
        <View key={label} style={styles.field}>
          <Text style={[styles.label, { color: customColors.text }]}>{label}</Text>
          <Text style={[styles.value, { color: customColors.text }]}>{value}</Text>
        </View>
      ))}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: customColors.text }]}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: customColors.card }]}
          onPress={() => navigation.navigate('NutritionSearch')}
        >
          <Ionicons name="search" size={24} color={customColors.primary} />
          <Text style={[styles.actionText, { color: customColors.text }]}>Nutrition Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: customColors.card }]}
          onPress={() => navigation.navigate('Reminders')}
        >
          <Ionicons name="notifications" size={24} color={customColors.primary} />
          <Text style={[styles.actionText, { color: customColors.text }]}>Reminders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: customColors.card }]}
          onPress={() => navigation.navigate('WeightLog')}
        >
          <Ionicons name="scale" size={24} color={customColors.primary} />
          <Text style={[styles.actionText, { color: customColors.text }]}>Log Weight</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: customColors.card }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={24} color={customColors.primary} />
          <Text style={[styles.actionText, { color: customColors.text }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setEditModalVisible(false)}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <ScrollView style={styles.modalScrollView}>
          <View style={[styles.modalContent, { backgroundColor: customColors.background }]}>
            <Text style={[styles.modalTitle, { color: customColors.text }]}>Edit Profile</Text>

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.card,
                color: customColors.text,
                borderColor: customColors.border
              }]}
              value={editingProfile?.name}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, name: text })}
              placeholder="Enter your name"
              placeholderTextColor={customColors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Age</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.card,
                color: customColors.text,
                borderColor: customColors.border
              }]}
              value={editingProfile?.age?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, age: text })}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor={customColors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Gender</Text>
            <Picker
              selectedValue={editingProfile?.gender}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, gender: value })}
              items={genders}
              style={[styles.picker, { 
                backgroundColor: customColors.card,
                borderColor: customColors.border
              }]}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.card,
                color: customColors.text,
                borderColor: customColors.border
              }]}
              value={editingProfile?.height?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, height: text })}
              keyboardType="numeric"
              placeholder="Enter your height in cm"
              placeholderTextColor={customColors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Current Weight (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.card,
                color: customColors.text,
                borderColor: customColors.border
              }]}
              value={editingProfile?.weight?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, weight: text })}
              keyboardType="numeric"
              placeholder="Enter your current weight in kg"
              placeholderTextColor={customColors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Target Weight (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: customColors.card,
                color: customColors.text,
                borderColor: customColors.border
              }]}
              value={editingProfile?.targetWeight?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, targetWeight: text })}
              keyboardType="numeric"
              placeholder="Enter your target weight in kg"
              placeholderTextColor={customColors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Activity Level</Text>
            <Picker
              selectedValue={editingProfile?.activityLevel}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, activityLevel: value })}
              items={activityLevels}
              style={[styles.picker, { 
                backgroundColor: customColors.card,
                borderColor: customColors.border
              }]}
            />

            <Text style={[styles.inputLabel, { color: customColors.text }]}>Goal</Text>
            <Picker
              selectedValue={editingProfile?.goal}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, goal: value })}
              items={goals}
              style={[styles.picker, { 
                backgroundColor: customColors.card,
                borderColor: customColors.border
              }]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: customColors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: customColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: customColors.primary }]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  {loading ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: customColors.text }]}>Profile</Text>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: customColors.primary }]}
            onPress={handleEditPress}
          >
            <Ionicons name="pencil" size={16} color="white" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {renderQuickActions()}

        {renderSection('Personal Information', [
          { label: 'Name', value: formatValue(user?.profile?.name) },
          { label: 'Age', value: formatValue(user?.profile?.age, ' years') },
          { label: 'Gender', value: formatValue(user?.profile?.gender?.charAt(0).toUpperCase() + user?.profile?.gender?.slice(1)) },
        ])}

        {renderSection('Physical Information', [
          { label: 'Height', value: formatValue(user?.profile?.height, ' cm') },
          { label: 'Current Weight', value: formatValue(user?.profile?.weight, ' kg') },
          { label: 'Target Weight', value: formatValue(user?.profile?.targetWeight, ' kg') },
        ])}

        {renderSection('Fitness Information', [
          { label: 'Activity Level', value: formatActivityLevel(user?.profile?.activityLevel) },
          { label: 'Goal', value: formatGoal(user?.profile?.goal) },
        ])}

        {renderSection('Account Information', [
          { label: 'Email', value: formatValue(user?.email) },
          { label: 'Member Since', value: formatMemberSince(user?.createdAt) },
          { label: 'Premium Status', value: user?.isPremium ? 'Premium' : 'Free' },
        ])}

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FF5252' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out" size={20} color="white" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {renderEditModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 52) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    opacity: 0.8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    width: '90%',
    maxHeight: '80%',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  picker: {
    height: 50,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    borderWidth: 0,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen; 