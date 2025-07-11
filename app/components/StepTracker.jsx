import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useStepTracking } from '../hooks/useStepTracking';

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

const StepTracker = ({ onStepUpdate }) => {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  
  const {
    steps,
    isTracking,
    isAvailable,
    loading,
    error,
    resetSteps,
    simulateStep,
    stopTracking,
    getStepHistory,
  } = useStepTracking();
  
  const [goal, setGoal] = useState(10000);
  const [goalInput, setGoalInput] = useState('10000');

  // Notify parent component of step updates
  useEffect(() => {
    if (onStepUpdate) {
      onStepUpdate(steps);
    }
  }, [steps, onStepUpdate]);

  // Show error if tracking fails
  useEffect(() => {
    if (error) {
      Alert.alert('Step Tracking Error', error);
    }
  }, [error]);

  const handleResetSteps = async () => {
    await resetSteps();
  };

  const handleGoalChange = (text) => {
    setGoalInput(text);
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      setGoal(num);
    }
  };

  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <View style={[styles.container, { backgroundColor: customColors.card, borderColor: customColors.border }]}> 
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="footsteps" size={24} color={customColors.primary} />
          <Text style={[styles.title, { color: customColors.text }]}>Step Tracker</Text>
        </View>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.stepCount}>
          <Text style={[styles.stepNumber, { color: customColors.primary }]}>{steps.toLocaleString()}</Text>
          <Text style={[styles.stepLabel, { color: customColors.text }]}>steps today</Text>
          {loading && (
            <Text style={[styles.statusText, { color: customColors.text }]}>Loading...</Text>
          )}
          {!loading && isTracking && (
            <Text style={[styles.statusText, { color: customColors.primary }]}>✓ Tracking</Text>
          )}
          {!loading && !isTracking && !isAvailable && (
            <Text style={[styles.statusText, { color: customColors.error }]}>Simulation Mode</Text>
          )}
        </View>
        <View style={styles.goalContainer}>
          <Text style={[styles.goalText, { color: customColors.text }]}>Goal:</Text>
          <TextInput
            style={[styles.goalInput, { color: customColors.text, borderColor: customColors.border }]}
            value={goalInput}
            onChangeText={handleGoalChange}
            keyboardType="numeric"
            maxLength={6}
          />
          <View style={[styles.progressBar, { backgroundColor: customColors.border }]}> 
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`, 
                  backgroundColor: customColors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: customColors.text }]}> {progress.toFixed(1)}% complete </Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: customColors.secondary }]}
          onPress={handleResetSteps}
        >
          <Ionicons name="refresh" size={16} color="white" />
          <Text style={styles.actionButtonText}>Reset</Text>
        </TouchableOpacity>
        {(!isAvailable || Platform.OS === 'web') && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: customColors.primary }]}
            onPress={simulateStep}
          >
            <Ionicons name="walk" size={16} color="white" />
            <Text style={styles.actionButtonText}>Simulate Step</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepCount: {
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  stepLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    marginTop: 2,
    fontStyle: 'italic',
  },
  goalContainer: {
    flex: 1,
    marginLeft: 20,
  },
  goalText: {
    fontSize: 14,
    marginBottom: 8,
  },
  goalInput: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StepTracker; 