/**
 * Maps mood rating (1-10) to corresponding emoji
 */
export const getEmojiForMood = (rating: number): string => {
  const emojiMap: { [key: number]: string } = {
    1: '😭', // crying
    2: '😢', // sad tears
    3: '😞', // disappointed
    4: '😕', // slightly frowning/confused
    5: '😐', // neutral/expressionless
    6: '🙂', // slight smile
    7: '😊', // smiling with eyes
    8: '😄', // big happy smile
    9: '🤗', // excited/hugging
    10: '🥳', // party/celebrating
  };

  // Clamp rating to valid range
  const clampedRating = Math.max(1, Math.min(10, Math.round(rating)));
  return emojiMap[clampedRating] || emojiMap[5];
};

