import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useStepTracking } from '../hooks/useStepTracking';

const StepTrackerTest = () => {
  const { isDark } = useTheme();
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
    initializeTracking,
  } = useStepTracking();

  const handleGetHistory = async () => {
    const history = await getStepHistory();
    Alert.alert('Step History', JSON.stringify(history, null, 2));
  };

  const handleTestBackground = async () => {
    Alert.alert(
      'Background Test',
      'The app will now track steps in the background. Try:\n\n1. Minimize the app\n2. Walk around for a few minutes\n3. Return to the app\n\nYou should see updated step counts!',
      [
        { text: 'OK', onPress: () => console.log('Background test started') }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: customColors.card }]}>
      <Text style={[styles.title, { color: customColors.text }]}>Step Tracker Debug</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: customColors.text }]}>
          Steps: {steps}
        </Text>
        <Text style={[styles.statusText, { color: customColors.text }]}>
          Tracking: {isTracking ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.statusText, { color: customColors.text }]}>
          Available: {isAvailable ? 'Yes' : 'No'}
        </Text>
        <Text style={[styles.statusText, { color: customColors.text }]}>
          Loading: {loading ? 'Yes' : 'No'}
        </Text>
        {error && (
          <Text style={[styles.errorText, { color: customColors.error }]}>
            Error: {error}
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: customColors.primary }]}
          onPress={handleTestBackground}
        >
          <Text style={styles.buttonText}>Test Background</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: customColors.secondary }]}
          onPress={handleGetHistory}
        >
          <Text style={styles.buttonText}>Get History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: customColors.error }]}
          onPress={resetSteps}
        >
          <Text style={styles.buttonText}>Reset Steps</Text>
        </TouchableOpacity>

        {!isAvailable && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: customColors.primary }]}
            onPress={simulateStep}
          >
            <Text style={styles.buttonText}>Simulate Step</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default StepTrackerTest; 