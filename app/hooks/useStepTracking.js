import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import backgroundStepTracker from '../services/backgroundStepTracker';

export const useStepTracking = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize step tracking
  const initializeTracking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if we're on web (fallback to simulation)
      if (Platform.OS === 'web') {
        setIsAvailable(false);
        setIsTracking(false);
        setLoading(false);
        return;
      }

      // Initialize background tracker
      await backgroundStepTracker.initialize((newSteps) => {
        setSteps(newSteps);
      });

      // Get current steps
      const currentSteps = await backgroundStepTracker.getCurrentSteps();
      setSteps(currentSteps);
      setIsTracking(true);
      setIsAvailable(true);
    } catch (err) {
      console.error('Failed to initialize step tracking:', err);
      setError(err.message);
      setIsAvailable(false);
      setIsTracking(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset steps
  const resetSteps = useCallback(async () => {
    try {
      if (isAvailable) {
        await backgroundStepTracker.resetSteps();
      } else {
        setSteps(0);
      }
    } catch (err) {
      console.error('Failed to reset steps:', err);
      setError(err.message);
    }
  }, [isAvailable]);

  // Simulate step (for web or when pedometer is not available)
  const simulateStep = useCallback(() => {
    if (!isAvailable || Platform.OS === 'web') {
      setSteps(prev => prev + 1);
    }
  }, [isAvailable]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    try {
      if (isAvailable) {
        await backgroundStepTracker.stopTracking();
      }
      setIsTracking(false);
    } catch (err) {
      console.error('Failed to stop tracking:', err);
      setError(err.message);
    }
  }, [isAvailable]);

  // Get step history
  const getStepHistory = useCallback(async () => {
    try {
      if (isAvailable) {
        return await backgroundStepTracker.getStepHistory();
      }
      return null;
    } catch (err) {
      console.error('Failed to get step history:', err);
      return null;
    }
  }, [isAvailable]);

  // Initialize on mount
  useEffect(() => {
    initializeTracking();

    // Cleanup on unmount
    return () => {
      if (isTracking) {
        stopTracking();
      }
    };
  }, []);

  return {
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
  };
}; 