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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
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
            value={Math.min((todayTotal / dailyGoal) * 100, 100)}
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

        {user?.isPremium && monthlyLogs.length > 0 && (
          <Card style={styles.logsCard}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Monthly Water Intake</Text>
            <LineChart
              data={getMonthlyChartData()}
              width={320}
              height={180}
              chartConfig={{
                backgroundColor: theme.colors.card,
                backgroundGradientFrom: theme.colors.card,
                backgroundGradientTo: theme.colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.colors.primary + Math.round(opacity * 255).toString(16),
                labelColor: () => theme.colors.text,
                style: { borderRadius: 16 },
              }}
              bezier
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
          </Card>
        )}

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

      <Modal
        visible={showGlassSizeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGlassSizeModal(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.dark ? '#1A1A1A' : theme.colors.surface,
            borderColor: theme.colors.border,
            borderWidth: 1,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Customize Glass Size
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.dark ? '#2C2C2E' : theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
                borderRadius: 8,
                marginBottom: 20,
              }]}
              value={customGlassSize.toString()}
              onChangeText={(text) => setCustomGlassSize(parseInt(text) || 0)}
              keyboardType="numeric"
              placeholder="Enter glass size in ml"
              placeholderTextColor={theme.colors.text + '80'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { 
                  backgroundColor: theme.dark ? '#2C2C2E' : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderWidth: 1,
                  marginRight: 8,
                }]}
                onPress={() => setShowGlassSizeModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { 
                  backgroundColor: theme.colors.primary,
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

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
        onPress={addWaterLog}
      >
        <Ionicons name="add" size={24} color="white" />
        <Text style={styles.addButtonText}>Add Water ({glassSize}ml)</Text>
      </TouchableOpacity>
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