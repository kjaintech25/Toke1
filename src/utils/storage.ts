import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, STORAGE_KEY } from '../types/mood';

/**
 * Get all mood entries from storage
 */
export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading mood entries:', error);
    return [];
  }
};

/**
 * Get mood entry for a specific date
 */
export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | null> => {
  try {
    const entries = await getMoodEntries();
    return entries.find((entry) => entry.date === date) || null;
  } catch (error) {
    console.error('Error getting mood entry by date:', error);
    return null;
  }
};

/**
 * Save a mood entry (creates new or updates existing for specified date)
 * @param rating - Mood rating 1-10
 * @param notes - Optional journal notes
 * @param date - Optional date string (YYYY-MM-DD), defaults to today
 */
export const saveMoodEntry = async (
  rating: number,
  notes?: string,
  date?: string
): Promise<MoodEntry> => {
  try {
    const entries = await getMoodEntries();
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();

    // Check if entry exists for the target date
    const existingIndex = entries.findIndex((entry) => entry.date === targetDate);

    const newEntry: MoodEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : `mood_${timestamp}`,
      date: targetDate,
      rating,
      timestamp,
      notes: notes !== undefined ? notes : (existingIndex >= 0 ? entries[existingIndex].notes : undefined),
    };

    if (existingIndex >= 0) {
      // Update existing entry - preserve notes if not provided
      if (notes === undefined && entries[existingIndex].notes) {
        newEntry.notes = entries[existingIndex].notes;
      }
      entries[existingIndex] = newEntry;
    } else {
      // Add new entry
      entries.push(newEntry);
    }

    // Sort by timestamp (newest first - descending order for history)
    entries.sort((a, b) => b.date.localeCompare(a.date));

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};