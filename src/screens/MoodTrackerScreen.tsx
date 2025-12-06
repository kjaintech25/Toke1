import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { GradientBackground } from '../components/GradientBackground';
import { MoodEmoji } from '../components/MoodEmoji';
import { MoodSlider } from '../components/MoodSlider';
import { saveMoodEntry } from '../utils/storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MoodTrackerScreenProps {
  navigation: any;
}

/**
 * MoodTrackerScreen - Main mood tracking interface
 * Layout: Emoji upper 60%, Slider bottom 25-30%
 * Features: Real-time updates, save functionality, calendar navigation
 */
export const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({ navigation }) => {
  const [moodValue, setMoodValue] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const saveButtonScale = useSharedValue(1);
  const saveConfirmationOpacity = useSharedValue(0);

  const handleValueChange = (value: number) => {
    setMoodValue(value);
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    
    // Animate button press
    saveButtonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );

    try {
      await saveMoodEntry(moodValue);
      
      // Show confirmation
      saveConfirmationOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 1500 }),
        withTiming(0, { duration: 200 })
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCalendarPress = () => {
    navigation.navigate('History');
  };

  const saveButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: saveButtonScale.value }],
    };
  });

  const confirmationStyle = useAnimatedStyle(() => {
    return {
      opacity: saveConfirmationOpacity.value,
    };
  });

  return (
    <View style={styles.container}>
      <GradientBackground moodValue={moodValue} />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header with calendar icon */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Mood Tracker - Track Your Daily Mood</Text>
          <TouchableOpacity
            onPress={handleCalendarPress}
            style={styles.calendarButton}
            activeOpacity={0.7}
          >
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Emoji section - upper 60% */}
        <View style={styles.emojiContainer}>
          <MoodEmoji moodValue={moodValue} />
        </View>

        {/* Slider and button section - bottom 25-30% */}
        <View style={styles.bottomSection}>
          <MoodSlider value={moodValue} onValueChange={handleValueChange} />
          
          <Animated.View style={[styles.saveButtonContainer, saveButtonStyle]}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Log Mood'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Save confirmation */}
          <Animated.View style={[styles.confirmation, confirmationStyle]}>
            <Text style={styles.confirmationText}>✓ Mood saved!</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
  },
  calendarButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarIcon: {
    fontSize: 24,
  },
  emojiContainer: {
    flex: 0.6, // Upper 60%
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    flex: 0.3, // Bottom 25-30% (using 0.3 for better spacing)
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButtonContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 150,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmation: {
    marginTop: 12,
    alignItems: 'center',
  },
  confirmationText: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 14,
    fontWeight: '500',
  },
});

