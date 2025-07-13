import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import MongoDBService from '../services/mongodb.service';
import Card from './ui/Card';

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

const PremiumFeature = ({ children, featureName }) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  const [isPremium, setIsPremium] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumStatus();
  }, []);

  const checkPremiumStatus = async () => {
    try {
      const userData = await MongoDBService.getProfile();
      setIsPremium(userData.isPremium || false);
    } catch (error) {
      console.error('Error checking premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePress = () => {
    setShowModal(false);
    navigation.navigate('Premium');
  };

  if (loading) {
    return null;
  }

  if (!isPremium) {
    return (
      <>
        <TouchableOpacity
          style={[styles.container, { backgroundColor: customColors.card }]}
          onPress={() => setShowModal(true)}
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: customColors.text }]}>
              🔒 Premium Feature
            </Text>
            <Text style={[styles.description, { color: customColors.text }]}>
              Upgrade to access {featureName}
            </Text>
            <TouchableOpacity
              style={[styles.upgradeButton, { backgroundColor: customColors.primary }]}
              onPress={handleUpgradePress}
            >
              <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <View style={styles.modalContainer}>
            <Card style={[styles.modalContent, { backgroundColor: customColors.card }]}>
              <Text style={[styles.modalTitle, { color: customColors.text }]}>
                Premium Feature
              </Text>
              <Text style={[styles.modalDescription, { color: customColors.text }]}>
                {featureName} is a premium feature. Upgrade to unlock this and all other premium features!
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: customColors.border }]}
                  onPress={() => setShowModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: customColors.text }]}>
                    Maybe Later
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: customColors.primary }]}
                  onPress={handleUpgradePress}
                >
                  <Text style={styles.modalButtonText}>
                    Upgrade Now
                  </Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </Modal>
      </>
    );
  }

  return children;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.8,
  },
  upgradeButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PremiumFeature; 