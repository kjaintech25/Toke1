import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { getMoodEntries } from '../utils/storage';
import { MoodEntry } from '../types/mood';
import { getEmojiForMood } from '../utils/emojiMap';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DAY_SIZE = (SCREEN_WIDTH - 60) / 7; // 7 days per week with padding

type ViewMode = 'list' | 'calendar';

interface HistoryScreenProps {
  navigation: any;
}

/**
 * HistoryScreen displays past mood entries in either list or calendar view
 * Users can toggle between views
 */
export const HistoryScreen: React.FC<HistoryScreenProps> = ({ navigation }) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    loadEntries();
    
    // Refresh when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadEntries();
    });

    return unsubscribe;
  }, [navigation]);

  const loadEntries = async () => {
    const loadedEntries = await getMoodEntries();
    setEntries(loadedEntries);
  };

  const renderListItem = ({ item }: { item: MoodEntry }) => {
    const date = parseISO(item.date);
    const formattedDate = format(date, 'MMMM d, yyyy');
    
    return (
      <View style={styles.listItem}>
        <Text style={styles.listEmoji}>{getEmojiForMood(item.rating)}</Text>
        <View style={styles.listItemContent}>
          <Text style={styles.listDate}>{formattedDate}</Text>
          <Text style={styles.listRating}>Rating: {item.rating}/10</Text>
        </View>
      </View>
    );
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get first day of week for the month
    const firstDayOfWeek = monthStart.getDay();
    
    // Create array with empty cells for days before month starts
    const calendarDays: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendarDays.push(null);
    }
    days.forEach(day => calendarDays.push(day));

    // Group days into weeks
    const weeks: (Date | null)[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }

    const getEntryForDate = (date: Date | null): MoodEntry | null => {
      if (!date) return null;
      return entries.find(entry => isSameDay(parseISO(entry.date), date)) || null;
    };

    return (
      <View style={styles.calendarContainer}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            onPress={() => {
              const prevMonth = new Date(currentMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              setCurrentMonth(prevMonth);
            }}
          >
            <Text style={styles.calendarNavButton}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.calendarMonth}>
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              const nextMonth = new Date(currentMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              setCurrentMonth(nextMonth);
            }}
          >
            <Text style={styles.calendarNavButton}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day labels */}
        <View style={styles.calendarWeekLabels}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text key={day} style={styles.calendarWeekLabel}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.calendarWeek}>
            {week.map((day, dayIndex) => {
              const entry = getEntryForDate(day);
              return (
                <View
                  key={dayIndex}
                  style={[
                    styles.calendarDay,
                    !day && styles.calendarDayEmpty,
                  ]}
                >
                  {day && (
                    <>
                      <Text style={styles.calendarDayNumber}>
                        {format(day, 'd')}
                      </Text>
                      {entry && (
                        <Text style={styles.calendarDayEmoji}>
                          {getEmojiForMood(entry.rating)}
                        </Text>
                      )}
                    </>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mood History</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleButtonActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No mood entries yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start tracking your mood to see history here
          </Text>
        </View>
      ) : viewMode === 'list' ? (
        <FlatList
          data={entries}
          renderItem={renderListItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderCalendarView()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listEmoji: {
    fontSize: 40,
    marginRight: 16,
  },
  listItemContent: {
    flex: 1,
  },
  listDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  listRating: {
    fontSize: 14,
    color: '#666',
  },
  calendarContainer: {
    padding: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  calendarNavButton: {
    fontSize: 32,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  calendarMonth: {
    fontSize: 18,
    fontWeight: '600',
  },
  calendarWeekLabels: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  calendarWeekLabel: {
    width: DAY_SIZE,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  calendarWeek: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  calendarDay: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 2,
  },
  calendarDayEmpty: {
    backgroundColor: 'transparent',
  },
  calendarDayNumber: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
  calendarDayEmoji: {
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

