import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { GradientBackground } from '../components/GradientBackground';
import { MoodEmoji } from '../components/MoodEmoji';
import { MoodSlider } from '../components/MoodSlider';
import { DateScrollBar } from '../components/DateScrollBar';
import { JournalModal } from '../components/JournalModal';
import { saveMoodEntry, getMoodEntryByDate } from '../utils/storage';
import { MoodEntry } from '../types/mood';
import { format, isSameDay } from 'date-fns';
import { getColorForMood, shouldUseDarkText } from '../utils/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MoodTrackerScreenProps {
  navigation: any;
  route?: any; // Add route prop
}

/**
 * MoodTrackerScreen - Main mood tracking interface
 * Layout: Calendar bar at top, Large emoji center (75%), Slider bottom (15%)
 * Features: Tap emoji to save, journal popup, date selection, load existing entries
 */
export const MoodTrackerScreen: React.FC<MoodTrackerScreenProps> = ({
  navigation,
  route,
}) => {
  const [moodValue, setMoodValue] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  // Initialize with route param date if provided, otherwise today
  const [selectedDate, setSelectedDate] = useState(() => {
    if (route?.params?.selectedDate) {
      return new Date(route.params.selectedDate);
    }
    return new Date();
  });
  const [showJournalModal, setShowJournalModal] = useState(false);
  const [pendingMoodValue, setPendingMoodValue] = useState(5);
  const [existingEntry, setExistingEntry] = useState<MoodEntry | null>(null);
  const [isUpdatingRating, setIsUpdatingRating] = useState(false);
  const [disableAutoScroll, setDisableAutoScroll] = useState(false);

  // Check if we came from another page (has route params) - keep auto-scroll disabled
  useEffect(() => {
    if (route?.params?.selectedDate) {
      const dateFromRoute = new Date(route.params.selectedDate);
      setSelectedDate(dateFromRoute);
      setDisableAutoScroll(true); // Keep disabled when coming from another page
      // Don't re-enable - let user stay on that date
    }
  }, [route?.params?.selectedDate]);

  // Disable auto-scroll when selected date is not today
  // This runs AFTER the route params check, so it will override if needed
  useEffect(() => {
    const isSelectedToday = isSameDay(selectedDate, new Date());
    // Only enable auto-scroll if we're on today AND didn't come from route params
    if (isSelectedToday && !route?.params?.selectedDate) {
      setDisableAutoScroll(false); // Enable only when on today and not from navigation
    } else {
      setDisableAutoScroll(true); // Disable for all other cases
    }
  }, [selectedDate, route?.params?.selectedDate]);

  // Listen for navigation focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Check if current selected date is today
      const isSelectedToday = isSameDay(selectedDate, new Date());
      // Only enable if on today AND no route params (didn't come from navigation)
      if (isSelectedToday && !route?.params?.selectedDate) {
        setDisableAutoScroll(false);
      } else {
        setDisableAutoScroll(true);
      }
    });

    return unsubscribe;
  }, [navigation, route?.params?.selectedDate, selectedDate]);

  // Calculate if we should use dark text based on current mood color
  const moodColor = getColorForMood(moodValue);
  const useDarkText = shouldUseDarkText(moodColor);
  const textColor = useDarkText ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.98)';
  const textShadowColor = useDarkText ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';

  // Load existing entry when date changes
  useEffect(() => {
    loadEntryForDate(selectedDate);
  }, [selectedDate]);

  const loadEntryForDate = async (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const entry = await getMoodEntryByDate(dateString);
    setExistingEntry(entry);
    
    if (entry) {
      setMoodValue(entry.rating);
    } else {
      // Reset to default if no entry exists
      setMoodValue(5);
    }
  };

  const handleValueChange = (value: number) => {
    setMoodValue(value);
  };

  const handleEmojiPress = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setPendingMoodValue(moodValue);

    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      const existingNotes = existingEntry?.notes || '';
      
      // Save mood with existing notes (if any)
      await saveMoodEntry(moodValue, existingNotes, dateString);
      
      // Show journal modal with existing notes pre-filled
      setShowJournalModal(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to save mood entry. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateRating = () => {
    setIsUpdatingRating(true);
    // Reset rating to default but keep journal entry
    setMoodValue(5);
  };

  const handleJournalSave = async (notes: string) => {
    try {
      const dateString = format(selectedDate, 'yyyy-MM-dd');
      // Update the entry with new rating and notes
      await saveMoodEntry(pendingMoodValue, notes, dateString);
      
      // Reload entry to reflect changes
      await loadEntryForDate(selectedDate);
    } catch (error) {
      Alert.alert('Error', 'Failed to save journal entry.');
      console.error('Journal save error:', error);
    }
  };

  const handleJournalView = () => {
    // Show journal modal in view/edit mode
    setShowJournalModal(true);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Auto-scroll will be disabled/enabled based on whether date is today
  };

  const handleCalendarPress = () => {
    navigation.navigate('History');
  };

  const handleHomePress = () => {
    const today = new Date();
    setSelectedDate(today);
    // Clear route params to allow auto-scroll
    navigation.setParams({ selectedDate: null });
    setDisableAutoScroll(false); // Enable auto-scroll when going to today
  };

  const isToday = isSameDay(selectedDate, new Date());
  const hasEntry = existingEntry !== null;
  const hasJournal = existingEntry?.notes && existingEntry.notes.trim().length > 0;

  return (
    <View style={styles.container}>
      <GradientBackground moodValue={moodValue} />

      <SafeAreaView style={styles.safeArea}>
        {/* Calendar scroll bar at top */}
        <DateScrollBar
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          moodValue={moodValue}
          disableAutoScroll={disableAutoScroll}
        />

        {/* Header with home and history buttons */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: textColor, textShadowColor }]}>
            Mood Tracker
          </Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              onPress={handleHomePress}
              style={[styles.headerButton, { backgroundColor: useDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)' }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerButtonIcon, { textShadowColor }]}>🏠</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCalendarPress}
              style={[styles.headerButton, { backgroundColor: useDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)' }]}
              activeOpacity={0.7}
            >
              <Text style={[styles.headerButtonIcon, { textShadowColor }]}>📅</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Large emoji section - takes up 75% of screen */}
        <View style={styles.emojiContainer}>
          <MoodEmoji moodValue={moodValue} onPress={handleEmojiPress} />
          {isSaving && (
            <Text style={[styles.savingText, { color: textColor, textShadowColor }]}>
              Saving...
            </Text>
          )}
          
          {/* Action buttons for existing entries */}
          {hasEntry && (
            <View style={styles.actionButtonsContainer}>
              {hasJournal && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: useDarkText ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)' }]}
                  onPress={handleJournalView}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.actionButtonText, { color: textColor, textShadowColor }]}>
                    📝 Journal
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: useDarkText ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.3)' }]}
                onPress={handleUpdateRating}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionButtonText, { color: textColor, textShadowColor }]}>
                  ✏️ Update Rating
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Slider section - bottom 15% */}
        <View style={styles.bottomSection}>
          <MoodSlider value={moodValue} onValueChange={handleValueChange} />
          <Text style={[styles.hintText, { color: textColor, textShadowColor }]}>
            {hasEntry ? 'Tap the emoji to update your mood' : 'Tap the emoji to save your mood'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Journal Modal */}
      <JournalModal
        visible={showJournalModal}
        onClose={() => {
          setShowJournalModal(false);
          setIsUpdatingRating(false);
        }}
        onSave={handleJournalSave}
        initialNotes={existingEntry?.notes || ''}
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
    fontSize: 24,
    fontWeight: '800',
    flex: 1,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerButtonIcon: {
    fontSize: 24,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emojiContainer: {
    flex: 0.75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savingText: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '700',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
    paddingHorizontal: 20,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  bottomSection: {
    flex: 0.15,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  hintText: {
    marginTop: 12,
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '600',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});