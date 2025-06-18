import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const WATER_GOAL = 2000; // 2L per day
const GLASS_SIZE = 250; // 250ml per glass

const WaterTrackerScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [waterLogs, setWaterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [glassSize, setGlassSize] = useState(user?.isPremium ? 250 : 250); // Default 250ml for all users
  const [customGlassSize, setCustomGlassSize] = useState(250);
  const [showGlassSizeModal, setShowGlassSizeModal] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(WATER_GOAL);

  useEffect(() => {
    loadWaterLogs();
  }, []);

  const loadWaterLogs = async () => {
    try {
      setLoading(true);
      const logs = await mongodbService.getWaterLogs();
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = logs.filter(log => log.createdAt.startsWith(today));
      setWaterLogs(todayLogs);
      const total = todayLogs.reduce((sum, log) => sum + log.amount, 0);
      setTodayTotal(total);
    } catch (error) {
      if (error.message.includes('premium')) {
        // Handle premium feature error gracefully
        setWaterLogs([]);
      } else {
        console.error('Error loading water logs:', error);
        Alert.alert('Error', 'Failed to load water logs');
      }
    } finally {
      setLoading(false);
    }
  };

  const addWaterLog = async () => {
    try {
      const newLog = await mongodbService.addWaterLog({ amount: glassSize });
      setWaterLogs([...waterLogs, newLog]);
    } catch (error) {
      if (error.message.includes('premium')) {
        Alert.alert(
          'Premium Feature',
          'Upgrade to premium to access custom glass sizes and detailed water tracking!'
        );
      } else {
        Alert.alert('Error', 'Failed to add water log');
      }
    }
  };

  const removeLastGlass = async () => {
    try {
      if (waterLogs.length === 0) {
        Alert.alert('Info', 'No water logs to remove');
        return;
      }
      setLoading(true);
      const lastLog = waterLogs[waterLogs.length - 1];
      await mongodbService.deleteWaterLog(lastLog._id);
      await loadWaterLogs();
    } catch (error) {
      console.error('Error removing water:', error);
      Alert.alert('Error', 'Failed to remove water');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const renderWaterLog = (log, index) => (
    <Text key={index} style={[styles.logEntry, { color: theme.colors.text }]}>
      {`${log.amount}ml at ${formatTime(log.createdAt)}`}
    </Text>
  );

  const renderPremiumFeatures = () => {
    if (!user?.isPremium) {
      return (
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: theme.colors.primary + '20' }]}
          onPress={() => navigation.navigate('Premium')}
        >
          <Ionicons name="star" size={32} color={theme.colors.primary} />
          <Text style={[styles.premiumTitle, { color: theme.colors.text }]}>
            Upgrade to Premium
          </Text>
          <Text style={[styles.premiumText, { color: theme.colors.text }]}>
            Get access to custom glass sizes, monthly projections, and detailed analytics!
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <TouchableOpacity
          style={[styles.customizeButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setShowGlassSizeModal(true)}
        >
          <Ionicons name="options-outline" size={24} color="white" />
          <Text style={styles.customizeButtonText}>Customize Glass Size</Text>
        </TouchableOpacity>

        <View style={styles.projectionCard}>
          <Text style={[styles.projectionTitle, { color: theme.colors.text }]}>
            Monthly Projection
          </Text>
          {/* Add your monthly projection chart/graph here */}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Water Tracker</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.statsTitle, { color: theme.colors.text }]}>
            Today's Water Intake
          </Text>
          <Text style={[styles.statsValue, { color: theme.colors.primary }]}>
            {todayTotal}ml
          </Text>
          <Text style={[styles.statsSubtext, { color: theme.colors.text }]}>
            Goal: {dailyGoal}ml
          </Text>
        </View>

        {renderPremiumFeatures()}

        <View style={styles.progressContainer}>
          <CircularProgress
            value={(todayTotal / dailyGoal) * 100}
            radius={80}
            duration={1000}
            progressValueColor={theme.colors.text}
            maxValue={100}
            title={`${todayTotal}ml / ${dailyGoal}ml`}
            titleColor={theme.colors.text}
            titleStyle={{ fontSize: 14 }}
            activeStrokeColor={theme.colors.primary}
            inActiveStrokeColor={theme.colors.border}
          />
        </View>

        <Card style={styles.logsCard}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Today's Logs
          </Text>
          {waterLogs.length > 0 ? (
            waterLogs.map(renderWaterLog)
          ) : (
            <Text style={[styles.emptyText, { color: theme.colors.text }]}>
              No water logged today
            </Text>
          )}
        </Card>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={addWaterLog}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Water ({glassSize}ml)</Text>
      </TouchableOpacity>

      <Modal
        visible={showGlassSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGlassSizeModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Customize Glass Size
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }]}
              value={customGlassSize.toString()}
              onChangeText={(text) => setCustomGlassSize(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="Enter glass size in ml"
              placeholderTextColor={theme.colors.text + '80'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.error }]}
                onPress={() => setShowGlassSizeModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => {
                  setGlassSize(customGlassSize);
                  setShowGlassSizeModal(false);
                }}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  logsCard: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  logEntry: {
    fontSize: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  premiumCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  premiumText: {
    fontSize: 16,
    textAlign: 'center',
  },
  customizeButton: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  customizeButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  projectionCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  projectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsSubtext: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  content: {
    flexGrow: 1,
  },
  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'gray',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    flex: 1,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default WaterTrackerScreen; 