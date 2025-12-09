// Replace the saveMoodEntry function (lines 8-41) with this:
export const saveMoodEntry = async (
  rating: number,
  notes?: string
): Promise<MoodEntry> => {
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
      notes: notes || undefined, // Save journal notes
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