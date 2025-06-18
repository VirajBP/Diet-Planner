import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const OnboardingContext = createContext({});

export const useOnboarding = () => {
  return useContext(OnboardingContext);
};

export const OnboardingProvider = ({ children }) => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem('hasSeenOnboarding');
      setHasSeenOnboarding(status === 'true');
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasSeenOnboarding,
        completeOnboarding,
        loading,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}; 