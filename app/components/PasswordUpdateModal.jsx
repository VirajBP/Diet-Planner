import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const PasswordUpdateModal = ({ visible, onClose, onSuccess }) => {
  const { theme } = useTheme();
  const isDark = theme.dark;
  
  const customColors = isDark ? {
    primary: '#27AE60',
    secondary: '#48C9B0',
    background: '#121212',
    surface: '#1E1E1E',
    text: '#FAFAFA',
    card: '#1E1E1E',
    border: '#48C9B0',
    error: '#FF5252',
  } : {
    primary: '#2ECC71',
    secondary: '#A3E4D7',
    background: '#FDFEFE',
    surface: '#FFFFFF',
    text: '#1C1C1C',
    card: '#FFFFFF',
    border: '#A3E4D7',
    error: '#FF5252',
  };

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert('Error', passwordError);
      return;
    }

    try {
      setLoading(true);
      await mongodbService.updatePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password updated successfully', [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onSuccess?.();
            onClose();
          }
        }
      ]);
    } catch (error) {
      let message = error.message || 'Failed to update password';
      console.log(error.message)
      if (message.toLowerCase().includes('incorrect')) {
        message = 'The current password you entered is incorrect.';
      } else if (message.toLowerCase().includes('weak')) {
        message = 'The new password is too weak.';
      } else if (message.toLowerCase().includes('server')) {
        message = 'Server error. Please try again later.';
      }
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: customColors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: customColors.text }]}>
              Update Password
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={customColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: customColors.text }]}>
              Current Password
            </Text>
            <View style={[styles.passwordInput, { backgroundColor: customColors.background, borderColor: customColors.border }]}>
              <TextInput
                style={[styles.input, { color: customColors.text }]}
                placeholder="Enter current password"
                placeholderTextColor="#8E8E93"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off" : "eye"}
                  size={20}
                  color={customColors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: customColors.text }]}>
              New Password
            </Text>
            <View style={[styles.passwordInput, { backgroundColor: customColors.background, borderColor: customColors.border }]}>
              <TextInput
                style={[styles.input, { color: customColors.text }]}
                placeholder="Enter new password"
                placeholderTextColor="#8E8E93"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off" : "eye"}
                  size={20}
                  color={customColors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: customColors.text }]}>
              Confirm New Password
            </Text>
            <View style={[styles.passwordInput, { backgroundColor: customColors.background, borderColor: customColors.border }]}>
              <TextInput
                style={[styles.input, { color: customColors.text }]}
                placeholder="Confirm new password"
                placeholderTextColor="#8E8E93"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={customColors.text}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.passwordRequirements, { color: customColors.text }]}>
            Password must be at least 6 characters with uppercase, lowercase, and number
          </Text>

          <TouchableOpacity
            style={[
              styles.updateButton,
              { backgroundColor: customColors.primary },
              loading && styles.disabledButton
            ]}
            onPress={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.updateButtonText}>Update Password</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 24,
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
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 8,
  },
  passwordRequirements: {
    fontSize: 12,
    marginBottom: 24,
    fontStyle: 'italic',
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  updateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PasswordUpdateModal; 