import React from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { getColorForMood, shouldUseDarkText } from '../utils/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 80; // Padding on both sides
const SLIDER_HEIGHT = 50;
const THUMB_SIZE = 24;
const THUMB_SIZE_ACTIVE = 32;
const MIN_VALUE = 1;
const MAX_VALUE = 10;
const DEFAULT_VALUE = 5;

interface MoodSliderProps {
  value: number;
  onValueChange: (value: number) => void;
}

/**
 * MoodSlider component - a custom horizontal slider with smooth dragging
 * Range: 1-10, default: 5
 * Provides visual feedback with larger thumb when active
 */
export const MoodSlider: React.FC<MoodSliderProps> = ({ value, onValueChange }) => {
  const translateX = useSharedValue((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE) * SLIDER_WIDTH);
  const isActive = useSharedValue(false);

  // Update translateX when value prop changes externally
  React.useEffect(() => {
    translateX.value = withSpring(
      ((value - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * SLIDER_WIDTH,
      { damping: 15, stiffness: 150 }
    );
  }, [value]);

  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = true;
      startX.value = translateX.value;
    })
    .onUpdate((e) => {
      const newX = Math.max(0, Math.min(SLIDER_WIDTH, startX.value + e.translationX));
      translateX.value = newX;
      
      // Calculate value from position
      const ratio = newX / SLIDER_WIDTH;
      const newValue = MIN_VALUE + ratio * (MAX_VALUE - MIN_VALUE);
      const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, newValue));
      
      runOnJS(onValueChange)(Math.round(clampedValue));
    })
    .onEnd(() => {
      isActive.value = false;
      // Snap to nearest integer value
      const ratio = translateX.value / SLIDER_WIDTH;
      const snappedValue = Math.round(MIN_VALUE + ratio * (MAX_VALUE - MIN_VALUE));
      const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, snappedValue));
      translateX.value = withSpring(
        ((clampedValue - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * SLIDER_WIDTH,
        { damping: 15, stiffness: 150 }
      );
      runOnJS(onValueChange)(clampedValue);
    });

  const tapGesture = Gesture.Tap()
    .onEnd((e) => {
      const tapX = e.x;
      const clampedX = Math.max(0, Math.min(SLIDER_WIDTH, tapX));
      const ratio = clampedX / SLIDER_WIDTH;
      const newValue = Math.round(MIN_VALUE + ratio * (MAX_VALUE - MIN_VALUE));
      const clampedValue = Math.max(MIN_VALUE, Math.min(MAX_VALUE, newValue));
      
      translateX.value = withSpring(
        ((clampedValue - MIN_VALUE) / (MAX_VALUE - MIN_VALUE)) * SLIDER_WIDTH,
        { damping: 15, stiffness: 150 }
      );
      runOnJS(onValueChange)(clampedValue);
    });

  // Use Exclusive to prioritize pan over tap (pan will cancel tap if user drags)
  const composedGesture = Gesture.Exclusive(panGesture, tapGesture);

  const thumbStyle = useAnimatedStyle(() => {
    const size = isActive.value ? THUMB_SIZE_ACTIVE : THUMB_SIZE;
    return {
      width: withSpring(size, { damping: 15, stiffness: 150 }),
      height: withSpring(size, { damping: 15, stiffness: 150 }),
      borderRadius: size / 2,
      transform: [{ translateX: translateX.value }],
    };
  });

  const trackStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + THUMB_SIZE / 2,
    };
  });

  // Calculate if we should use dark text based on current mood color
  const moodColor = getColorForMood(value);
  const useDarkText = shouldUseDarkText(moodColor);
  const textColor = useDarkText ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.98)';
  const textShadowColor = useDarkText ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <View style={styles.sliderContainer}>
          {/* Track background */}
          <View style={styles.trackBackground} />
          
          {/* Active track */}
          <Animated.View style={[styles.trackActive, trackStyle]} />
          
          {/* Thumb */}
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <View style={styles.thumbInner} />
          </Animated.View>
        </View>
      </GestureDetector>
      
      {/* Value labels */}
      <View style={styles.labels}>
        <Text style={[styles.label, { color: textColor, textShadowColor }]}>1</Text>
        <Text style={[styles.label, { color: textColor, textShadowColor }]}>5</Text>
        <Text style={[styles.label, { color: textColor, textShadowColor }]}>10</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SLIDER_WIDTH,
    alignSelf: 'center',
  },
  sliderContainer: {
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 2,
  },
  trackActive: {
    position: 'absolute',
    left: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: THUMB_SIZE / 2,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 13,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

