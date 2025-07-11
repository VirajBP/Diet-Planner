import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ContactUsScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
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
      <View style={[styles.header]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={customColors.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: customColors.primary }]}>Contact Us</Text>
      </View>
      <View style={[styles.content, { backgroundColor: customColors.background }]}> 
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color={customColors.primary} />
          <Text style={[styles.infoText, { color: customColors.text }]}>viraj.pradhan04@gmail.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={24} color={customColors.primary} />
          <Text style={[styles.infoText, { color: customColors.text }]}>+91 981-928-9735</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={24} color={customColors.primary} />
          <Text style={[styles.infoText, { color: customColors.text }]}>123 Wellness Ave, Healthy City, USA</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1,  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, marginTop:10 },
  backButton: { position: 'absolute', left: 16, zIndex: 2 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { width: 100, height: 100, marginBottom: 24, resizeMode: 'contain' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { fontSize: 18, marginLeft: 12 },
});

export default ContactUsScreen; 