import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StepTracker from '../components/StepTracker';
import VideoPlayer from '../components/VideoPlayer';
import { useTheme } from '../context/ThemeContext';
import { mongodbService } from '../services/mongodb.service';
// Uncomment the line below to add the debug component for testing background step tracking
// import StepTrackerTest from '../components/StepTrackerTest';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const EXERCISE_CATEGORIES = [
  { label: 'Cardio', value: 'cardio' },
  { label: 'Strength', value: 'strength' },
  { label: 'Flexibility', value: 'flexibility' },
  { label: 'Yoga', value: 'yoga' },
  { label: 'HIIT', value: 'hiit' },
];

// Sample exercise data - in a real app, this would come from an API
const SAMPLE_EXERCISES = [
  {
    id: 1,
    name: 'Jumping Jacks',
    category: 'cardio',
    duration: '10 minutes',
    calories: 100,
    difficulty: 'Beginner',
    description: 'A full-body cardiovascular exercise that improves coordination and burns calories.',
    steps: [
      'Stand with your feet together and arms at your sides',
      'Jump and spread your legs while raising your arms above your head',
      'Jump back to the starting position',
      'Repeat continuously for the duration'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872001.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    isStepBased: true
  },
  {
    id: 2,
    name: 'Push-ups',
    category: 'strength',
    duration: '5 minutes',
    calories: 80,
    difficulty: 'Intermediate',
    description: 'A classic upper body exercise that targets chest, shoulders, and triceps.',
    steps: [
      'Start in a plank position with hands shoulder-width apart',
      'Lower your body until your chest nearly touches the floor',
      'Push back up to the starting position',
      'Keep your core tight throughout the movement'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872002.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 3,
    name: 'Downward Dog',
    category: 'yoga',
    duration: '3 minutes',
    calories: 30,
    difficulty: 'Beginner',
    description: 'A foundational yoga pose that stretches and strengthens the entire body.',
    steps: [
      'Start on your hands and knees',
      'Lift your hips up and back, forming an inverted V shape',
      'Press your hands into the ground and lengthen your spine',
      'Hold the position and breathe deeply'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872003.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 4,
    name: 'Burpees',
    category: 'hiit',
    duration: '8 minutes',
    calories: 120,
    difficulty: 'Advanced',
    description: 'A high-intensity full-body exercise that combines strength and cardio.',
    steps: [
      'Start standing, then drop into a squat position',
      'Place your hands on the ground and kick your feet back into a plank',
      'Perform a push-up, then jump your feet back to squat position',
      'Jump up from the squat position and repeat'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872004.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: true
  },
  {
    id: 5,
    name: 'Plank',
    category: 'strength',
    duration: '5 minutes',
    calories: 50,
    difficulty: 'Beginner',
    description: 'An isometric core exercise that improves stability and posture.',
    steps: [
      'Start in a forearm plank position',
      'Keep your body in a straight line from head to heels',
      'Engage your core and hold the position',
      'Breathe steadily throughout the exercise'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872005.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 6,
    name: 'Mountain Climbers',
    category: 'cardio',
    duration: '7 minutes',
    calories: 90,
    difficulty: 'Intermediate',
    description: 'A dynamic exercise that targets the core while providing cardiovascular benefits.',
    steps: [
      'Start in a plank position',
      'Drive one knee toward your chest',
      'Quickly switch legs in a running motion',
      'Keep your core engaged throughout the movement'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872006.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: true
  },
  {
    id: 7,
    name: 'Squats',
    category: 'strength',
    duration: '6 minutes',
    calories: 70,
    difficulty: 'Beginner',
    description: 'A fundamental lower body exercise that builds strength in legs and glutes.',
    steps: [
      'Stand with feet shoulder-width apart',
      'Lower your body as if sitting back into a chair',
      'Keep your chest up and knees behind toes',
      'Return to standing position and repeat'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872007.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 8,
    name: 'Lunges',
    category: 'strength',
    duration: '8 minutes',
    calories: 85,
    difficulty: 'Intermediate',
    description: 'A unilateral exercise that improves balance and leg strength.',
    steps: [
      'Step forward with one leg',
      'Lower your body until both knees are bent',
      'Push back to starting position',
      'Alternate legs and repeat'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872008.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 9,
    name: 'Sun Salutation',
    category: 'yoga',
    duration: '5 minutes',
    calories: 40,
    difficulty: 'Beginner',
    description: 'A flowing sequence of yoga poses that warm up the entire body.',
    steps: [
      'Start in mountain pose',
      'Flow through forward fold, plank, and upward dog',
      'Return to downward dog',
      'Flow back to standing position'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872009.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: false
  },
  {
    id: 10,
    name: 'High Knees',
    category: 'cardio',
    duration: '5 minutes',
    calories: 75,
    difficulty: 'Beginner',
    description: 'A high-intensity cardio exercise that improves coordination and burns calories.',
    steps: [
      'Stand in place and start jogging',
      'Bring your knees up to waist level',
      'Pump your arms as you run',
      'Maintain a steady pace throughout'
    ],
    videoUrl: 'https://player.vimeo.com/external/370872010.sd.mp4?s=6e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e&profile_id=164', // Pexels
    imageUrl: 'https://images.pexels.com/photos/2261482/pexels-photo-2261482.jpeg',
    isStepBased: true
  }
];

const ExerciseScreen = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState(SAMPLE_EXERCISES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState({});
  const [stepsExpanded, setStepsExpanded] = useState({});
  const [dailySteps, setDailySteps] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [pexelsVideos, setPexelsVideos] = useState([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [pexelsError, setPexelsError] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExercises();
  }, [selectedCategory, searchQuery]);

  const filterExercises = () => {
    let filtered = exercises;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(exercise => exercise.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(exercise => 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredExercises(filtered);
  };

  const handleToggleExpand = (exerciseId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(prev => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  const handleToggleSteps = (exerciseId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStepsExpanded(prev => ({ ...prev, [exerciseId]: !prev[exerciseId] }));
  };

  const playVideo = (exercise) => {
    setSelectedVideo(exercise);
  };

  const renderExerciseCard = (exercise) => {
    const isExpanded = expanded[exercise.id];
    const isStepsExpanded = stepsExpanded[exercise.id];

    return (
      <TouchableOpacity
        key={exercise.id}
        activeOpacity={0.95}
        onPress={() => handleToggleExpand(exercise.id)}
        style={[styles.exerciseCard, { backgroundColor: customColors.card, borderColor: customColors.border }]}
      >
        <View style={styles.exerciseHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={[styles.exerciseName, { color: customColors.text }]}>{exercise.name}</Text>
            <View style={styles.exerciseMeta}>
              <View style={[styles.categoryTag, { backgroundColor: customColors.primary + '20' }]}>
                <Text style={[styles.categoryText, { color: customColors.primary }]}>{exercise.category}</Text>
              </View>
              <View style={[styles.difficultyTag, { backgroundColor: customColors.secondary + '20' }]}>
                <Text style={[styles.difficultyText, { color: customColors.secondary }]}>{exercise.difficulty}</Text>
              </View>
            </View>
          </View>
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={customColors.text} 
          />
        </View>

        <View style={styles.exerciseStats}>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color={customColors.text + '80'} />
            <Text style={[styles.statText, { color: customColors.text }]}>{exercise.duration}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame-outline" size={16} color={customColors.text + '80'} />
            <Text style={[styles.statText, { color: customColors.text }]}>{exercise.calories} cal</Text>
          </View>
          {/* Steps stat removed for all exercises */}
        </View>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={[styles.description, { color: customColors.text }]}>{exercise.description}</Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: customColors.primary }]}
                onPress={(e) => { e.stopPropagation && e.stopPropagation(); playVideo(exercise); }}
              >
                <Ionicons name="play" size={16} color="white" />
                <Text style={styles.actionButtonText}>Watch Video</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: customColors.secondary }]}
                onPress={(e) => { e.stopPropagation && e.stopPropagation(); handleToggleSteps(exercise.id); }}
              >
                <Ionicons name="list" size={16} color="white" />
                <Text style={styles.actionButtonText}>View Steps</Text>
              </TouchableOpacity>
            </View>

            {isStepsExpanded && (
              <View style={styles.stepsContainer}>
                <Text style={[styles.stepsTitle, { color: customColors.text }]}>How to perform:</Text>
                {exercise.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: customColors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: customColors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'all' && { backgroundColor: customColors.primary }
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[
          styles.categoryButtonText,
          { color: selectedCategory === 'all' ? 'white' : customColors.text }
        ]}>All</Text>
      </TouchableOpacity>
      
      {EXERCISE_CATEGORIES.map(category => (
        <TouchableOpacity
          key={category.value}
          style={[
            styles.categoryButton,
            selectedCategory === category.value && { backgroundColor: customColors.primary }
          ]}
          onPress={() => setSelectedCategory(category.value)}
        >
          <Text style={[
            styles.categoryButtonText,
            { color: selectedCategory === category.value ? 'white' : customColors.text }
          ]}>{category.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPexelsVideos = () => (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles.section, { color: customColors.text }]}>Exercise Videos (Pexels)</Text>
      {pexelsLoading ? (
        <ActivityIndicator size="small" color={customColors.primary} />
      ) : pexelsError ? (
        <Text style={{ color: customColors.error }}>{pexelsError}</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pexelsVideos.map((video) => (
            <View key={video.id} style={{ width: 220, marginRight: 12 }}>
              <VideoPlayer
                videoUrl={video.video_files?.[0]?.link}
                thumbnailUrl={video.image}
                style={{ height: 120, borderRadius: 8 }}
              />
              <Text style={{ color: customColors.text, fontSize: 12, marginTop: 4 }} numberOfLines={1}>
                {video.user?.name || 'Pexels'}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );

  const fetchExercises = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'all') params.tag = selectedCategory;
      if (searchQuery) params.name = searchQuery;
      const data = await mongodbService.getExerciseVideos(params);
      setExercises(data);
    } catch (err) {
      setError('Failed to load exercise videos');
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: customColors.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={customColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: customColors.text }]}>Exercises</Text>
          <View style={styles.headerSpacer} />
        </View>

        <TextInput
          style={[styles.searchInput, { backgroundColor: customColors.card, color: customColors.text, borderColor: customColors.border }]}
          placeholder="Search exercises..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />

        {renderPexelsVideos()}
        {renderCategoryFilter()}

        <StepTracker onStepUpdate={setDailySteps} />

        {/* Uncomment the line below to add the debug component for testing background step tracking */}
        {/* <StepTrackerTest /> */}

        {error && <Text style={{ color: customColors.error, marginBottom: 16 }}>{error}</Text>}

        <View style={styles.exercisesContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={customColors.primary} style={styles.loading} />
          ) : exercises.length > 0 ? (
            exercises.map(renderExerciseCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color={customColors.text + '40'} />
              <Text style={[styles.emptyText, { color: customColors.text }]}>No exercises found</Text>
              <Text style={[styles.emptySubtext, { color: customColors.text + '80' }]}>Try adjusting your search or filters</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {selectedVideo && (
        <VideoPlayer
          videoUrl={selectedVideo.videoUrl}
          title={selectedVideo.name}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  headerSpacer: {
    width: 44,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    fontSize: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exercisesContainer: {
    marginTop: 16,
  },
  exerciseCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exerciseMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '500',
  },
  exerciseStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  stepsContainer: {
    marginTop: 16,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  loading: {
    marginTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});

export default ExerciseScreen; 