import React, { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { getEmojiForMood } from '../utils/emojiMap';

interface MoodEmojiProps {
  moodValue: number;
}

/**
 * MoodEmoji component displays a large emoji (120-140px) that animates
 * with a subtle scale/bounce effect when the mood value changes
 */
export const MoodEmoji: React.FC<MoodEmojiProps> = ({ moodValue }) => {
  const scale = useSharedValue(1);
  const emoji = getEmojiForMood(moodValue);

  useEffect(() => {
    // Animate emoji with bounce effect when mood changes
    scale.value = withSequence(
      withSpring(1.2, { damping: 8, stiffness: 100 }),
      withSpring(1, { damping: 8, stiffness: 100 })
    );
  }, [moodValue]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 130, // Between 120-140px as specified
    textAlign: 'center',
  },
});

