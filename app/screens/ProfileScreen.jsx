import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '../components/ui/Picker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProfileScreen = ({ navigation }) => {
  const { theme } = useTheme();
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
      // Navigate to Auth stack instead of directly to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
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

  const renderSection = (title, fields) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>
      {fields.map(({ label, value }) => (
        <View key={label} style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.text }]}>{label}</Text>
          <Text style={[styles.value, { color: theme.colors.text }]}>{value}</Text>
        </View>
      ))}
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
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Edit Profile</Text>

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={editingProfile?.name}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, name: text })}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Age</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={editingProfile?.age?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, age: text })}
              keyboardType="numeric"
              placeholder="Enter your age"
              placeholderTextColor={theme.colors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Gender</Text>
            <Picker
              selectedValue={editingProfile?.gender}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, gender: value })}
              options={genders}
              placeholder="Select gender"
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={editingProfile?.height?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, height: text })}
              keyboardType="numeric"
              placeholder="Enter your height"
              placeholderTextColor={theme.colors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={editingProfile?.weight?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, weight: text })}
              keyboardType="numeric"
              placeholder="Enter your weight"
              placeholderTextColor={theme.colors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Target Weight (kg)</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.card,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={editingProfile?.targetWeight?.toString()}
              onChangeText={(text) => setEditingProfile({ ...editingProfile, targetWeight: text })}
              keyboardType="numeric"
              placeholder="Enter your target weight"
              placeholderTextColor={theme.colors.text + '80'}
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Activity Level</Text>
            <Picker
              selectedValue={editingProfile?.activityLevel}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, activityLevel: value })}
              options={activityLevels}
              placeholder="Select activity level"
            />

            <Text style={[styles.inputLabel, { color: theme.colors.text }]}>Goal</Text>
            <Picker
              selectedValue={editingProfile?.goal}
              onValueChange={(value) => setEditingProfile({ ...editingProfile, goal: value })}
              options={goals}
              placeholder="Select goal"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.colors.border }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>Profile</Text>
            <TouchableOpacity
              style={[styles.editButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleEditPress}
            >
              <Text style={[styles.editButtonText, { color: theme.dark ? '#000000' : '#FFFFFF' }]}>
                Edit
              </Text>
            </TouchableOpacity>
          </View>

          {renderSection('Personal Information', [
            { label: 'Name', value: formatValue(user?.profile?.name) },
            { label: 'Email', value: formatValue(user?.email) },
            { label: 'Age', value: formatValue(user?.profile?.age, ' years') },
            { label: 'Gender', value: formatValue(user?.profile?.gender) },
          ])}

          {renderSection('Body Measurements', [
            { label: 'Height', value: formatValue(user?.profile?.height, ' cm') },
            { label: 'Weight', value: formatValue(user?.profile?.weight, ' kg') },
          ])}

          {renderSection('Fitness Goals', [
            { label: 'Activity Level', value: formatActivityLevel(user?.profile?.activityLevel) },
            { label: 'Goal', value: formatGoal(user?.profile?.goal) },
          ])}

          {renderSection('Statistics', [
            { label: 'Total Calories Burned', value: formatValue(user?.profile?.stats?.totalCaloriesBurned, ' kcal') },
            { label: 'Total Workouts', value: formatValue(user?.profile?.stats?.totalWorkouts) },
            { label: 'Streak Days', value: formatValue(user?.profile?.stats?.streakDays, ' days') },
          ])}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleLogout}
          >
            <Text style={[styles.buttonText, { color: theme.dark ? '#000000' : '#FFFFFF' }]}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  field: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#30303030',
  },
  label: {
    fontSize: 16,
    flex: 1,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollView: {
    width: '100%',
  },
  modalContent: {
    padding: 20,
    borderRadius: 20,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 