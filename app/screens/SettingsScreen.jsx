import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PasswordUpdateModal from '../components/PasswordUpdateModal';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { toggleTheme, isDark } = useTheme();
  const { signOut } = useAuth();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

  const settingsOptions = [
    {
      title: 'Account',
      icon: 'person-outline',
      items: [
        {
          label: 'Edit Profile',
          icon: 'create-outline',
          onPress: () => navigation.navigate('Profile'),
        },
        {
          label: 'Premium Features',
          icon: 'star-outline',
          onPress: () => navigation.navigate('Premium'),
        },
        {
          label: 'Change Password',
          icon: 'key-outline',
          onPress: () => setPasswordModalVisible(true),
        },
      ],
    },
    {
      title: 'Preferences',
      icon: 'settings-outline',
      items: [
        {
          label: isDark ? 'Light Mode' : 'Dark Mode',
          icon: isDark ? 'sunny-outline' : 'moon-outline',
          onPress: toggleTheme,
        },
        {
          label: 'Notifications',
          icon: 'notifications-outline',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
        },
        {
          label: 'Language',
          icon: 'language-outline',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
        },
      ],
    },
    {
      title: 'Support',
      icon: 'help-circle-outline',
      items: [
        {
          label: 'Help Center',
          icon: 'information-circle-outline',
          onPress: () => navigation.navigate('HelpCenter'),
        },
        {
          label: 'Feedback',
          icon: 'chatbubble-outline',
          onPress: () => navigation.navigate('Feedback'),
        },
        {
          label: 'Contact Us',
          icon: 'mail-outline',
          onPress: () => navigation.navigate('ContactUs'),
        },
        {
          label: 'About Us',
          icon: 'people-outline',
          onPress: () => navigation.navigate('AboutUs'),
        },
        {
          label: 'Privacy Policy',
          icon: 'shield-outline',
          onPress: () => navigation.navigate('PrivacyPolicy'),
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      // Navigation will happen automatically based on authentication state
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: customColors.background,
    },
    contentWrapper: {
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: customColors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 8,
      color: customColors.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: customColors.surface,
    },
    optionLabel: {
      fontSize: 16,
      marginLeft: 12,
      color: customColors.text,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 12,
      borderRadius: 12,
      marginTop: 24,
      marginBottom: 32,
      backgroundColor: customColors.error,
    },
  };

  return (
    <SafeAreaView style={[dynamicStyles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>
      <ScrollView style={styles.content} contentContainerStyle={{ width: '100%' }}>
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={20} color={customColors.primary} />
              <Text style={dynamicStyles.sectionTitle}>{section.title}</Text>
            </View>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={dynamicStyles.option}
                onPress={item.onPress}
              >
                <View style={styles.optionContent}>
                  <Ionicons name={item.icon} size={20} color={customColors.primary} />
                  <Text style={dynamicStyles.optionLabel}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={customColors.text} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <TouchableOpacity style={dynamicStyles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
      <PasswordUpdateModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 32,
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    width: '100%',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default SettingsScreen; 