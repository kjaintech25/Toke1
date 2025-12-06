import React, { useMemo } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getColorForMood, colorToRgba, Color } from '../utils/colors';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  moodValue: number;
}

/**
 * GradientBackground component that displays a full-screen gradient
 * that changes color based on mood value with smooth transitions
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({ moodValue }) => {
  // Calculate colors for gradient with smooth interpolation
  const colors = useMemo(() => {
    const color1 = getColorForMood(moodValue);
    // Create a slightly darker/lighter version for gradient effect
    const color2: Color = {
      r: Math.max(0, Math.min(255, color1.r + 30)),
      g: Math.max(0, Math.min(255, color1.g + 30)),
      b: Math.max(0, Math.min(255, color1.b + 30)),
    };
    return [colorToRgba(color1), colorToRgba(color2)];
  }, [moodValue]);

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}
    />
  );
};

const styles = StyleSheet.create({
  gradient: {
    width,
    height,
  },
});

