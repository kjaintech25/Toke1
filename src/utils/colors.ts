/**
 * Color interpolation utilities for mood-based gradients
 * Maps mood values 1-10 to color ranges with smooth transitions
 */

export interface Color {
  r: number;
  g: number;
  b: number;
}

/**
 * Color stops for different mood ranges
 * Values 1-3: Deep blue → dark purple (melancholy/sad)
 * Values 4-5: Purple → muted lavender/gray (neutral transition)
 * Values 6-7: Soft warm tones → yellow/peach (positive emerging)
 * Values 8-10: Muted warm tones → soft green (happy/energetic but readable)
 */
const colorStops: { value: number; color: Color }[] = [
  { value: 1, color: { r: 30, g: 30, b: 100 } }, // Deep blue
  { value: 3, color: { r: 75, g: 0, b: 130 } }, // Dark purple
  { value: 4, color: { r: 128, g: 0, b: 128 } }, // Purple
  { value: 5, color: { r: 150, g: 120, b: 180 } }, // Muted lavender/gray
  { value: 6, color: { r: 255, g: 200, b: 150 } }, // Soft warm/peach
  { value: 7, color: { r: 255, g: 220, b: 140 } }, // Muted yellow/peach
  { value: 8, color: { r: 255, g: 200, b: 100 } }, // Muted warm yellow (less bright)
  { value: 9, color: { r: 200, g: 220, b: 120 } }, // Muted yellow-green
  { value: 10, color: { r: 160, g: 200, b: 120 } }, // Muted green (much less bright)
];

/**
 * Interpolates between two colors
 */
const interpolateColor = (color1: Color, color2: Color, t: number): Color => {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
  };
};

/**
 * Gets color for a specific mood value with smooth interpolation
 */
export const getColorForMood = (rating: number): Color => {
  // Clamp rating to valid range
  const clampedRating = Math.max(1, Math.min(10, rating));

  // Find the two color stops to interpolate between
  let lowerStop = colorStops[0];
  let upperStop = colorStops[colorStops.length - 1];

  for (let i = 0; i < colorStops.length - 1; i++) {
    if (clampedRating >= colorStops[i].value && clampedRating <= colorStops[i + 1].value) {
      lowerStop = colorStops[i];
      upperStop = colorStops[i + 1];
      break;
    }
  }

  // Calculate interpolation factor
  const range = upperStop.value - lowerStop.value;
  const t = range > 0 ? (clampedRating - lowerStop.value) / range : 0;

  return interpolateColor(lowerStop.color, upperStop.color, t);
};

/**
 * Calculate luminance of a color (0-1)
 * Higher values = brighter colors
 */
export const getLuminance = (color: Color): number => {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  
  const [rs, gs, bs] = [r, g, b].map(val => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Determines if text should be dark or light based on background color
 */
export const shouldUseDarkText = (color: Color): boolean => {
  return getLuminance(color) > 0.5;
};

/**
 * Converts Color object to hex string
 */
export const colorToHex = (color: Color): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
};

/**
 * Converts Color object to rgba string
 */
export const colorToRgba = (color: Color, alpha: number = 1): string => {
  return `rgba(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)}, ${alpha})`;
};

