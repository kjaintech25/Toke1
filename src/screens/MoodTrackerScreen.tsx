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
import { DateScrollBar } from '../components/DateScrollBar';
import { JournalModal } from '../components/JournalModal';
import { saveMoodEntry } from '../utils/storage';
import { format } from 'date-fns';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MoodTrackerScreenProps {
  navigation: any;
}

/**
 * MoodTrackerScreen - Main mood tracking interface
 * Layout: Calendar bar at top, Large emoji center (75%), Slider bottom (15%)
 * Features: Tap emoji to save, journal popup, date selection
 */
export const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({
  navigation,
}) => {
  const [moodValue, setMoodValue] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [pendingMoodValue, setPendingMoodValue] = useState(5);

  const handleValueChange = (value: number) => {
    setMoodValue(value);
  };

  const handleEmojiPress = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setPendingMoodValue(moodValue);

    try {
      // Save mood without notes first
      await saveMoodEntry(moodValue);
      
      // Show journal modal
      setShowJournalModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleJournalSave = async (notes: string) => {
    try {
      // Update the entry with journal notes
      await saveMoodEntry(pendingMoodValue, notes);
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal entry.');
      console.error('Journal save error:', error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // TODO: Load mood for selected date if it exists
  };

  const handleCalendarPress = () => {
    navigation.navigate('History');
  };

  return (
    <View style={styles.container}>
      <GradientBackground moodValue={moodValue} />

      <SafeAreaView style={styles.safeArea}>
        {/* Calendar scroll bar at top */}
        <DateScrollBar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />

        {/* Header with history button */}
        <View style={styles.header}>
          <Text style={styles.pageTitle}>Mood Tracker</Text>
          <TouchableOpacity
            onPress={handleCalendarPress}
            style={styles.calendarButton}
            activeOpacity={0.7}
          >
            <Text style={styles.calendarIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Large emoji section - takes up 75% of screen */}
        <View style={styles.emojiContainer}>
          <MoodEmoji moodValue={moodValue} onPress={handleEmojiPress} />
          {isSaving && (
            <Text style={styles.savingText}>Saving...</Text>
          )}
        </View>

        {/* Slider section - bottom 15% */}
        <View style={styles.bottomSection}>
          <MoodSlider value={moodValue} onValueChange={handleValueChange} />
          <Text style={styles.hintText}>Tap the emoji to save your mood</Text>
        </View>
      </SafeAreaView>

      {/* Journal Modal */}
      <JournalModal
        visible={showJournalModal}
        onClose={() => setShowJournalModal(false)}
        onSave={handleJournalSave}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
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
    flex: 0.75, // Takes up 75% of screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 20,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  bottomSection: {
    flex: 0.15, // Bottom 15%
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hintText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});