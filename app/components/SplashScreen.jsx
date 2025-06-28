import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Image
        source={require('../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.4,
    height: height * 0.2,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen; 