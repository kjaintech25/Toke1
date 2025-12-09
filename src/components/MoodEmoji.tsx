import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { getEmojiForMood } from '../utils/emojiMap';

interface MoodEmojiProps {
  moodValue: number;
  onPress?: () => void;
}

/**
 * MoodEmoji component displays a large emoji (220px) with 3D effects
 * that animates with a subtle scale/bounce effect when the mood value changes
 * Now tappable to save mood
 */
export const MoodEmoji: React.FC<MoodEmojiProps> = ({ moodValue, onPress }) => {
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
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.touchable}
    >
      <Animated.View style={[styles.container, animatedStyle]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  touchable: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // 3D shadow effects
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  emoji: {
    fontSize: 220, // Much larger - takes up more screen
    textAlign: 'center',
    // Additional 3D effect with text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
});