import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();

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
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
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
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
        },
        {
          label: 'Contact Us',
          icon: 'mail-outline',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
        },
        {
          label: 'Privacy Policy',
          icon: 'shield-outline',
          onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginLeft: 8,
      color: theme.colors.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: theme.colors.surface,
    },
    optionLabel: {
      fontSize: 16,
      marginLeft: 12,
      color: theme.colors.text,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderRadius: 12,
      marginTop: 24,
      marginBottom: 32,
      backgroundColor: theme.colors.error,
    },
  };

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {settingsOptions.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={20} color={theme.colors.primary} />
              <Text style={dynamicStyles.sectionTitle}>
                {section.title}
              </Text>
            </View>

            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={dynamicStyles.option}
                onPress={item.onPress}
              >
                <View style={styles.optionContent}>
                  <Ionicons name={item.icon} size={20} color={theme.colors.primary} />
                  <Text style={dynamicStyles.optionLabel}>
                    {item.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.colors.onSurfaceDisabled}
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <TouchableOpacity
          style={dynamicStyles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    flex: 1,
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