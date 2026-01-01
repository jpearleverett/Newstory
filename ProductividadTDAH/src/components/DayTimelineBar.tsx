import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';

interface DayTimelineBarProps {
  compact?: boolean;
}

const { width } = Dimensions.get('window');
const BAR_WIDTH = width - spacing.lg * 2;
const DAY_START = 6; // 6 AM
const DAY_END = 22; // 10 PM

export const DayTimelineBar: React.FC<DayTimelineBarProps> = ({ compact = false }) => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const getCurrentProgress = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const currentHourDecimal = hours + minutes / 60;

    // Clamp to day range
    if (currentHourDecimal < DAY_START) return 0;
    if (currentHourDecimal > DAY_END) return 1;

    return (currentHourDecimal - DAY_START) / (DAY_END - DAY_START);
  };

  const getTimeOfDay = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  const getGradientColors = (): [string, string, string, string] => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'morning':
        return ['#a8e6cf', '#88d8b0', '#ffeaa7', '#fdcb6e'];
      case 'afternoon':
        return ['#fdcb6e', '#f39c12', '#e17055', '#d63031'];
      case 'evening':
        return ['#d63031', '#6c5ce7', '#2d3436', '#1a1a2e'];
      default:
        return ['#a8e6cf', '#ffeaa7', '#e17055', '#2d3436'];
    }
  };

  const getTimeIcon = () => {
    const timeOfDay = getTimeOfDay();
    switch (timeOfDay) {
      case 'morning':
        return 'sunny-outline';
      case 'afternoon':
        return 'sunny';
      case 'evening':
        return 'moon-outline';
      default:
        return 'sunny-outline';
    }
  };

  const getRemainingHours = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();

    if (hours >= DAY_END) return 0;
    if (hours < DAY_START) return DAY_END - DAY_START;

    const remaining = DAY_END - hours - minutes / 60;
    return Math.max(0, remaining);
  };

  const formatRemainingTime = () => {
    const remaining = getRemainingHours();
    const hours = Math.floor(remaining);
    const minutes = Math.round((remaining - hours) * 60);

    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  const progress = getCurrentProgress();

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactBar}>
          <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.compactGradient}
          />
          {/* Progress overlay (remaining part faded) */}
          <View
            style={[
              styles.compactOverlay,
              { left: `${progress * 100}%` },
            ]}
          />
          {/* Current time indicator */}
          <View
            style={[
              styles.compactIndicator,
              { left: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.compactTime}>{formatRemainingTime()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name={getTimeIcon()} size={20} color={colors.primary} />
          <Text style={styles.headerText}>{t('timeline_your_day')}</Text>
        </View>
        <Text style={styles.remainingText}>
          {t('timeline_remaining', { time: formatRemainingTime() })}
        </Text>
      </View>

      {/* Timeline Bar */}
      <View style={styles.barContainer}>
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBar}
        />

        {/* Consumed time overlay */}
        <View
          style={[
            styles.consumedOverlay,
            { width: `${progress * 100}%` },
          ]}
        />

        {/* Current position indicator */}
        <View
          style={[
            styles.currentIndicator,
            { left: `${Math.min(progress * 100, 98)}%` },
          ]}
        >
          <View style={styles.indicatorDot} />
          <Text style={styles.indicatorTime}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>

      {/* Time labels */}
      <View style={styles.labelsContainer}>
        <Text style={styles.timeLabel}>6:00</Text>
        <Text style={styles.timeLabel}>12:00</Text>
        <Text style={styles.timeLabel}>18:00</Text>
        <Text style={styles.timeLabel}>22:00</Text>
      </View>

      {/* Motivational message based on time of day */}
      <Text style={styles.motivationalText}>
        {progress < 0.3
          ? t('timeline_message_morning')
          : progress < 0.6
          ? t('timeline_message_midday')
          : progress < 0.85
          ? t('timeline_message_evening')
          : t('timeline_message_night')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  remainingText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    fontWeight: fontWeight.medium,
  },
  barContainer: {
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.backgroundDark,
    position: 'relative',
  },
  gradientBar: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  consumedOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
  },
  currentIndicator: {
    position: 'absolute',
    top: -4,
    alignItems: 'center',
    transform: [{ translateX: -12 }],
  },
  indicatorDot: {
    width: 24,
    height: 32,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.textDark,
  },
  indicatorTime: {
    fontSize: fontSize.xs,
    color: colors.textDark,
    fontWeight: fontWeight.bold,
    marginTop: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.xs,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xs,
  },
  timeLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  motivationalText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.md,
    fontStyle: 'italic',
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  compactBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.backgroundDark,
    position: 'relative',
  },
  compactGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  compactOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  compactIndicator: {
    position: 'absolute',
    top: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.textDark,
    transform: [{ translateX: -6 }],
  },
  compactTime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textLight,
    minWidth: 50,
  },
});
