import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry, STORAGE_KEY } from '../types/mood';

/**
 * Saves a mood entry to AsyncStorage
 * If an entry exists for the same date, it will be updated
 */
export const saveMoodEntry = async (rating: number): Promise<MoodEntry> => {
  try {
    const entries = await getMoodEntries();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = Date.now();

    // Check if entry exists for today
    const existingIndex = entries.findIndex((entry) => entry.date === today);

    const newEntry: MoodEntry = {
      id: existingIndex >= 0 ? entries[existingIndex].id : `mood_${timestamp}`,
      date: today,
      rating,
      timestamp,
    };

    if (existingIndex >= 0) {
      // Update existing entry
      entries[existingIndex] = newEntry;
    } else {
      // Add new entry
      entries.push(newEntry);
    }

    // Sort by timestamp (most recent first)
    entries.sort((a, b) => b.timestamp - a.timestamp);

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

/**
 * Retrieves all mood entries from AsyncStorage
 */
export const getMoodEntries = async (): Promise<MoodEntry[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const entries: MoodEntry[] = JSON.parse(data);
      // Sort by timestamp (most recent first)
      return entries.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (error) {
    console.error('Error retrieving mood entries:', error);
    return [];
  }
};

/**
 * Gets mood entry for a specific date
 */
export const getMoodEntryByDate = async (date: string): Promise<MoodEntry | null> => {
  try {
    const entries = await getMoodEntries();
    return entries.find((entry) => entry.date === date) || null;
  } catch (error) {
    console.error('Error retrieving mood entry by date:', error);
    return null;
  }
};

/**
 * Deletes a mood entry by ID
 */
export const deleteMoodEntry = async (id: string): Promise<void> => {
  try {
    const entries = await getMoodEntries();
    const filtered = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    throw error;
  }
};

