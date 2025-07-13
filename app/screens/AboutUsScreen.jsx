import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const AboutUsScreen = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const customColors = isDark ? {
    primary: '#27AE60',
    background: '#121212',
    text: '#FAFAFA',
    card: '#1E1E1E',
  } : {
    primary: '#2ECC71',
    background: '#FDFEFE',
    text: '#1C1C1C',
    card: '#FFFFFF',
  };
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={customColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: customColors.primary }]}>About Us</Text>
      </View>
      <View style={[styles.content, { backgroundColor: customColors.background }]}> 
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={[styles.description, { color: customColors.text }]}>Diet Planner is your personal health companion, helping you track meals, water, and wellness goals. Our team is passionate about making healthy living simple and accessible for everyone. {'\n\n'}Built with love by the Diet Planner Team.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop:10 },
  backButton: { position: 'absolute', left: 16, zIndex: 2 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 100, height: 100, marginBottom: 24, resizeMode: 'contain' },
  description: { fontSize: 18, textAlign: 'center', lineHeight: 28 },
});

export default AboutUsScreen; 