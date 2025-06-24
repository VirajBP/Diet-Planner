import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
import { LineChart } from 'react-native-chart-kit';
import CircularProgress from 'react-native-circular-progress-indicator';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';

const WATER_GOAL = 2000; // 2L per day
const GLASS_SIZE = 250; // 250ml per glass

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

const WaterTrackerScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [waterLogs, setWaterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [glassSize, setGlassSize] = useState(user?.isPremium ? 250 : 250); // Default 250ml for all users
  const [customGlassSize, setCustomGlassSize] = useState(250);
  const [showGlassSizeModal, setShowGlassSizeModal] = useState(false);
  const [todayTotal, setTodayTotal] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(WATER_GOAL);
  const [monthlyLogs, setMonthlyLogs] = useState([]);
  const isDark = theme.dark;
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;

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
      // Monthly logs for premium users
      if (user?.isPremium) {
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const monthLogs = logs.filter(log => {
          const d = new Date(log.createdAt);
          return d.getMonth() === month && d.getFullYear() === year;
        });
        setMonthlyLogs(monthLogs);
      }
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
      let amount = glassSize;
      if (!user?.isPremium) {
        amount = 250; // Always use 250ml for free users
        setGlassSize(250);
      }
      const newLog = await mongodbService.addWaterLog({ amount });
      const updatedLogs = [...waterLogs, newLog];
      setWaterLogs(updatedLogs);
      const total = updatedLogs.reduce((sum, log) => sum + log.amount, 0);
      setTodayTotal(total);
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
    <Text key={index} style={[styles.logEntry, { color: customColors.text }]}>
      {`${log.amount}ml at ${formatTime(log.createdAt)}`}
    </Text>
  );

  const renderPremiumFeatures = () => {
    if (!user?.isPremium) {
      return (
        <TouchableOpacity
          style={[styles.premiumCard, { backgroundColor: customColors.primary + '20' }]}
          onPress={() => navigation.navigate('Premium')}
        >
          <Ionicons name="star" size={32} color={customColors.primary} />
          <Text style={[styles.premiumTitle, { color: customColors.text }]}>
            Upgrade to Premium
          </Text>
          <Text style={[styles.premiumText, { color: customColors.text }]}>
            Get access to custom glass sizes, monthly projections, and detailed analytics!
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <>
        <View style={styles.projectionCard}>
          <Text style={[styles.projectionTitle, { color: customColors.text }]}>
            Today's Water Intake
          </Text>
          {/* Add your monthly projection chart/graph here */}
        </View>
      </>
    );
  };

  // Calculate progress for the progress circle
  const progress = Math.min(todayTotal / dailyGoal, 1);

  // Helper to get chart data for monthly logs
  function getMonthlyChartData() {
    // Group by day
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const dailyTotals = Array(daysInMonth).fill(0);
    monthlyLogs.forEach(log => {
      const d = new Date(log.createdAt);
      const day = d.getDate() - 1;
      dailyTotals[day] += log.amount;
    });
    return {
      labels: Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString()),
      datasets: [{ data: dailyTotals }],
    };
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: customColors.text }]}>Water Tracker</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.addWaterSection}>
          <TouchableOpacity
            style={[styles.waterActionButton, styles.addGlassButton, { backgroundColor: customColors.primary }]}
            onPress={addWaterLog}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.waterActionButtonText}>Add Glass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.waterActionButton, styles.removeGlassButton, { backgroundColor: customColors.error }]}
            onPress={removeLastGlass}
          >
            <Ionicons name="remove" size={20} color="white" />
            <Text style={styles.waterActionButtonText}>Remove Glass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.waterActionButton, styles.customizeGlassButton, { backgroundColor: customColors.card, borderColor: customColors.primary, borderWidth: 1 }]}
            onPress={() => setShowGlassSizeModal(true)}
          >
            <Ionicons name="options-outline" size={20} color={customColors.primary} />
            <Text style={[styles.waterActionButtonText, { color: customColors.primary }]}>Customize</Text>
          </TouchableOpacity>
        </View>

        {renderPremiumFeatures()}

        <View style={styles.progressContainer}>
          <CircularProgress
            value={Math.min((todayTotal / dailyGoal) * 100, 100)}
            radius={80}
            duration={1000}
            progressValueColor={customColors.text}
            maxValue={100}
            title={`${todayTotal}ml / ${dailyGoal}ml`}
            titleColor={customColors.text}
            titleStyle={{ fontSize: 14 }}
            activeStrokeColor={customColors.primary}
            inActiveStrokeColor={customColors.border}
          />
        </View>

        <Modal
          visible={showGlassSizeModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGlassSizeModal(false)}
        >
          <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <View style={[styles.modalContent, { 
              backgroundColor: isDark ? '#1A1A1A' : customColors.surface,
              borderColor: customColors.border,
              borderWidth: 1,
            }]}>
              <Text style={[styles.modalTitle, { color: customColors.text }]}>
                Customize Glass Size
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: isDark ? '#2C2C2E' : customColors.background,
                  color: customColors.text,
                  borderColor: customColors.border,
                  borderRadius: 8,
                  marginBottom: 20,
                }]}
                value={customGlassSize.toString()}
                onChangeText={(text) => setCustomGlassSize(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="Enter glass size in ml"
                placeholderTextColor={customColors.text + '80'}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { 
                    backgroundColor: isDark ? '#2C2C2E' : customColors.surface,
                    borderColor: customColors.border,
                    borderWidth: 1,
                    marginRight: 8,
                  }]}
                  onPress={() => setShowGlassSizeModal(false)}
                >
                  <Text style={[styles.modalButtonText, { color: customColors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { 
                    backgroundColor: customColors.primary,
                    marginLeft: 8,
                  }]}
                  onPress={() => {
                    setGlassSize(customGlassSize);
                    setShowGlassSizeModal(false);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        
        {monthlyLogs.length > 0 && (
          <Card style={styles.logsCard}>
            <Text style={[styles.sectionTitle, { color: customColors.text }]}>Monthly Water Intake</Text>
            <LineChart
              data={getMonthlyChartData()}
              width={320}
              height={180}
              chartConfig={{
                backgroundColor: customColors.card,
                backgroundGradientFrom: customColors.card,
                backgroundGradientTo: customColors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => customColors.primary + Math.round(opacity * 255).toString(16),
                labelColor: () => customColors.text,
                style: { borderRadius: 16 },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </Card>
        )}

        <Card style={styles.logsCard}>
          <Text style={[styles.sectionTitle, { color: customColors.text }]}>
            Today's Logs
          </Text>
          {waterLogs.length > 0 ? (
            waterLogs.map(renderWaterLog)
          ) : (
            <Text style={[styles.emptyText, { color: customColors.text }]}>
              No water logged today
            </Text>
          )}
        </Card>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
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
  addWaterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  waterActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  addGlassButton: {},
  removeGlassButton: {},
  customizeGlassButton: {},
  waterActionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WaterTrackerScreen; 