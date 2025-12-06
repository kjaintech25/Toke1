/**
 * MoodEntry interface represents a single mood log entry
 */
export interface MoodEntry {
  id: string;
  date: string; // ISO date string (YYYY-MM-DD)
  rating: number; // 1-10
  timestamp: number; // Unix timestamp in milliseconds
  notes?: string; // Placeholder for future notes feature
}

/**
 * Storage key for AsyncStorage
 */
export const STORAGE_KEY = '@mood_tracker_entries';

