import React, { useRef, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { format, addDays, isSameDay } from 'date-fns';
import { getColorForMood, shouldUseDarkText } from '../utils/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DATE_ITEM_WIDTH = 80;
const DATE_ITEM_MARGIN = 2; // marginHorizontal from styles

interface DateScrollBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  moodValue?: number;
  disableAutoScroll?: boolean;
}

export const DateScrollBar: React.FC<DateScrollBarProps> = ({
  selectedDate,
  onDateSelect,
  moodValue = 5,
  disableAutoScroll = false,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const dates = useRef<Date[]>([]);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialized = useRef(false);
  const lastInteractionTime = useRef<number>(0);
  const today = new Date();

  // Generate dates: 7 days before and 7 days after today (15 total)
  useEffect(() => {
    const dateArray: Date[] = [];
    for (let i = -7; i <= 7; i++) {
      dateArray.push(addDays(today, i));
    }
    dates.current = dateArray;
  }, []);

  // FIXED: Function to center a date in the scroll view
  const centerDateInScroll = (date: Date, animated: boolean = true) => {
    if (!scrollViewRef.current || dates.current.length === 0) return;
    
    const index = dates.current.findIndex((d) => isSameDay(d, date));
    if (index >= 0) {
      // Calculate the total width of each item including margins
      const itemTotalWidth = DATE_ITEM_WIDTH + (DATE_ITEM_MARGIN * 2);
      
      // The key fix: scroll position = (index * item width)
      // No need to subtract screen width or add padding adjustments
      // because paddingHorizontal already handles the centering offset
      const scrollX = index * itemTotalWidth;
      
      scrollViewRef.current.scrollTo({
        x: Math.max(0, scrollX),
        animated,
      });
    }
  };

  // FIXED: Simplified initialization - single attempt with proper timing
  useEffect(() => {
    if (!hasInitialized.current && dates.current.length > 0) {
      // Wait for layout to complete, then center once
      const timeoutId = setTimeout(() => {
        if (scrollViewRef.current && dates.current.length > 0) {
          centerDateInScroll(selectedDate, false);
          hasInitialized.current = true;
        }
      }, 150); // Single delay, no retries needed
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate]);

  // FIXED: Simplified centering on date change
  useEffect(() => {
    if (hasInitialized.current && !isUserInteracting && !isScrolling && dates.current.length > 0) {
      // Small delay to avoid conflicts with user interaction
      const timeoutId = setTimeout(() => {
        if (!isUserInteracting && !isScrolling) {
          centerDateInScroll(selectedDate, true);
        }
      }, 50); // Reduced from 100ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate, isUserInteracting, isScrolling]);

  // Auto-scroll back to today - ONLY if enabled AND viewing today
  useEffect(() => {
    // Always clear any existing timeout first
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
      autoScrollTimeoutRef.current = null;
    }

    // CRITICAL: Only allow auto-scroll if:
    // 1. Auto-scroll is NOT disabled
    // 2. Selected date is NOT today (we want to scroll back to today)
    // 3. User is NOT currently interacting
    // 4. Scrolling has stopped
    // If ANY of these conditions fail, do NOT set up auto-scroll
    if (
      disableAutoScroll ||  // If disabled, don't auto-scroll at all
      isSameDay(selectedDate, today) ||  // If already on today, no need to scroll
      isUserInteracting ||  // If user is interacting, don't auto-scroll
      isScrolling  // If scrolling, don't auto-scroll
    ) {
      // Don't set up auto-scroll - just return
      return;
    }

    // Only if all conditions pass, set up the auto-scroll timer
    autoScrollTimeoutRef.current = setTimeout(() => {
      // Double-check ALL conditions again before scrolling
      if (
        disableAutoScroll ||  // Check disabled first
        isSameDay(selectedDate, today) ||  // Check if still not today
        isUserInteracting ||  // Check if user is interacting
        isScrolling ||  // Check if scrolling
        !scrollViewRef.current  // Check if ref exists
      ) {
        // Don't scroll - conditions changed
        return;
      }
      
      // All checks passed - scroll back to today
      centerDateInScroll(today, true);
      onDateSelect(today);
    }, 6000); // 6 seconds delay

    return () => {
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
        autoScrollTimeoutRef.current = null;
      }
    };
  }, [selectedDate, isUserInteracting, isScrolling, onDateSelect, disableAutoScroll]);

  const handleScrollBeginDrag = () => {
    setIsUserInteracting(true);
    setIsScrolling(true);
    lastInteractionTime.current = Date.now();
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
  };

  const handleScrollEndDrag = () => {
    setIsScrolling(false);
    lastInteractionTime.current = Date.now();
    // Keep user interaction flag for longer to prevent immediate auto-scroll
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 500); // Increased back to 500ms to give user time
  };

  const handleMomentumScrollEnd = () => {
    setIsScrolling(false);
    lastInteractionTime.current = Date.now();
    // Keep user interaction flag for longer
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 500); // Increased back to 500ms
  };

  // FIXED: Immediate centering when date is pressed
  const handleDatePress = (date: Date) => {
    setIsUserInteracting(true);
    lastInteractionTime.current = Date.now();
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    
    // Select the date first
    onDateSelect(date);
    
    // Center immediately (no 3000ms delay!)
    // Use requestAnimationFrame to ensure the state update has processed
    requestAnimationFrame(() => {
      centerDateInScroll(date, true);
    });
    
    // Release user interaction flag after a brief moment
    setTimeout(() => {
      setIsUserInteracting(false);
    }, 400); // Much shorter than 3000ms
  };

  const renderDateItem = (date: Date, index: number) => {
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, today);

    const moodColor = getColorForMood(moodValue);
    const useDarkText = shouldUseDarkText(moodColor);
    const textColor = useDarkText ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.98)';
    const textShadowColor = useDarkText ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateItem, isSelected && styles.dateItemSelected]}
        onPress={() => handleDatePress(date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.dayNameSelected,
            isToday && !isSelected && styles.dayNameToday,
            { color: textColor, textShadowColor }
          ]}
        >
          {format(date, 'EEE')}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.dayNumberSelected,
            isToday && !isSelected && styles.dayNumberToday,
            { color: textColor, textShadowColor }
          ]}
        >
          {format(date, 'd')}
        </Text>
        <Text
          style={[
            styles.monthName,
            isSelected && styles.monthNameSelected,
            { color: textColor, textShadowColor }
          ]}
        >
          {format(date, 'MMM')}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={DATE_ITEM_WIDTH + (DATE_ITEM_MARGIN * 2)}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {dates.current.map((date, index) => renderDateItem(date, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
  },
  scrollContent: {
    paddingHorizontal: SCREEN_WIDTH / 2 - DATE_ITEM_WIDTH / 2,
    alignItems: 'center',
  },
  dateItem: {
    width: DATE_ITEM_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: DATE_ITEM_MARGIN,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  dateItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    transform: [{ scale: 1.1 }],
  },
  dayName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dayNameSelected: {
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 3,
  },
  dayNameToday: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
  },
  dayNumber: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '700',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  dayNumberSelected: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 24,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 3,
  },
  dayNumberToday: {
    color: 'rgba(255, 255, 255, 0.98)',
    fontWeight: '800',
  },
  monthName: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  monthNameSelected: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowRadius: 3,
  },
});