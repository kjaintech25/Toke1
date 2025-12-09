import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DATE_ITEM_WIDTH = 80;

interface DateScrollBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

/**
 * DateScrollBar - Horizontal scrollable calendar bar
 * Shows current date in center with past and future dates
 */
export const DateScrollBar: React.FC<DateScrollBarProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const dates = useRef<Date[]>([]);

  // Generate dates: 30 days before and 30 days after today
  useEffect(() => {
    const today = new Date();
    const dateArray: Date[] = [];
    for (let i = -30; i <= 30; i++) {
      dateArray.push(addDays(today, i));
    }
    dates.current = dateArray;
  }, []);

  // Scroll to selected date when it changes
  useEffect(() => {
    const index = dates.current.findIndex((date) =>
      isSameDay(date, selectedDate)
    );
    if (index >= 0 && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * DATE_ITEM_WIDTH - SCREEN_WIDTH / 2 + DATE_ITEM_WIDTH / 2,
        animated: true,
      });
    }
  }, [selectedDate]);

  const renderDateItem = (date: Date, index: number) => {
    const isSelected = isSameDay(date, selectedDate);
    const isToday = isSameDay(date, new Date());

    return (
      <TouchableOpacity
        key={index}
        style={[styles.dateItem, isSelected && styles.dateItemSelected]}
        onPress={() => onDateSelect(date)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.dayName,
            isSelected && styles.dayNameSelected,
            isToday && !isSelected && styles.dayNameToday,
          ]}
        >
          {format(date, 'EEE')}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            isSelected && styles.dayNumberSelected,
            isToday && !isSelected && styles.dayNumberToday,
          ]}
        >
          {format(date, 'd')}
        </Text>
        <Text
          style={[
            styles.monthName,
            isSelected && styles.monthNameSelected,
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
        snapToInterval={DATE_ITEM_WIDTH}
        decelerationRate="fast"
      >
        {dates.current.map((date, index) => renderDateItem(date, index))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
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
    marginHorizontal: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dateItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ scale: 1.1 }],
  },
  dayName: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNameSelected: {
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '700',
  },
  dayNameToday: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  dayNumber: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: 'rgba(255, 255, 255, 1)',
    fontSize: 24,
    fontWeight: '700',
  },
  dayNumberToday: {
    color: 'rgba(255, 255, 255, 0.95)',
  },
  monthName: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  monthNameSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
});