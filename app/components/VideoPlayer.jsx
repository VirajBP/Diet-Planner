import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

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

const VideoPlayer = ({ videoUrl, title, onClose }) => {
  const { isDark } = useTheme();
  const customColors = isDark ? FRESH_CALM_DARK : FRESH_CALM_LIGHT;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={true}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: customColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: customColors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={customColors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: customColors.text }]} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Video Placeholder */}
        <View style={[styles.videoContainer, { backgroundColor: customColors.surface }]}>
          <View style={[styles.videoPlaceholder, { backgroundColor: customColors.border }]}>
            <Ionicons name="play-circle" size={80} color={customColors.primary} />
            <Text style={[styles.videoText, { color: customColors.text }]}>
              Video Player Placeholder
            </Text>
            <Text style={[styles.videoSubtext, { color: customColors.text + '80' }]}>
              In a real app, this would show the exercise video
            </Text>
          </View>
        </View>

        {/* Video Controls */}
        <View style={[styles.controls, { backgroundColor: customColors.card }]}>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: customColors.border }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(currentTime / duration) * 100}%`, 
                    backgroundColor: customColors.primary 
                  }
                ]} 
              />
            </View>
            <View style={styles.timeContainer}>
              <Text style={[styles.timeText, { color: customColors.text }]}>
                {formatTime(currentTime)}
              </Text>
              <Text style={[styles.timeText, { color: customColors.text }]}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>

          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-back" size={24} color={customColors.text} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.playButton, { backgroundColor: customColors.primary }]}
              onPress={togglePlay}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="play-skip-forward" size={24} color={customColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.additionalControls}>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="volume-high" size={20} color={customColors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton}>
              <Ionicons name="expand" size={20} color={customColors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Exercise Info */}
        <View style={[styles.infoContainer, { backgroundColor: customColors.card }]}>
          <Text style={[styles.infoTitle, { color: customColors.text }]}>Exercise Information</Text>
          <Text style={[styles.infoText, { color: customColors.text + '80' }]}>
            This video demonstrates the proper form and technique for this exercise. 
            Follow along carefully and maintain proper form throughout the movement.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerSpacer: {
    width: 32,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: width * 0.9,
    height: height * 0.4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  videoSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  controls: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 12,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 16,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default VideoPlayer; 