import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface BodyDoublingCounterProps {
  onSendKudos?: () => void;
  compact?: boolean;
}

export const BodyDoublingCounter: React.FC<BodyDoublingCounterProps> = ({
  onSendKudos,
  compact = false,
}) => {
  const { t } = useLanguage();
  const [focusingCount, setFocusingCount] = useState(0);
  const [showSparkle, setShowSparkle] = useState(false);
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Simulate real-time connection count
    // In production, this would connect to a real-time service
    const updateCount = () => {
      const baseCount = 300 + Math.floor(Math.random() * 200);
      const hourOfDay = new Date().getHours();

      // More people focusing during work hours
      let multiplier = 1;
      if (hourOfDay >= 9 && hourOfDay <= 11) multiplier = 1.5;
      else if (hourOfDay >= 14 && hourOfDay <= 16) multiplier = 1.3;
      else if (hourOfDay >= 20 && hourOfDay <= 22) multiplier = 1.2;
      else if (hourOfDay < 6 || hourOfDay > 23) multiplier = 0.3;

      setFocusingCount(Math.floor(baseCount * multiplier));
    };

    updateCount();
    const interval = setInterval(updateCount, 30000); // Update every 30 seconds

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Occasionally show sparkles to simulate someone completing a task
    const sparkleInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        triggerSparkle();
      }
    }, 15000);

    return () => clearInterval(sparkleInterval);
  }, []);

  const triggerSparkle = () => {
    setShowSparkle(true);
    Animated.sequence([
      Animated.timing(sparkleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(sparkleAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowSparkle(false));
  };

  const handleSendKudos = () => {
    haptic.success();
    triggerSparkle();
    onSendKudos?.();
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactDot} />
        <Text style={styles.compactText}>
          {focusingCount} {t('body_doubling_focusing')}
        </Text>
        {showSparkle && (
          <Animated.View
            style={[
              styles.sparkleCompact,
              {
                opacity: sparkleAnim,
                transform: [{ scale: sparkleAnim }],
              },
            ]}
          >
            <Text>✨</Text>
          </Animated.View>
        )}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.pulsingDot} />
          <Ionicons name="people" size={18} color={colors.primary} />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.count}>
            {focusingCount.toLocaleString()}
          </Text>
          <Text style={styles.label}>{t('body_doubling_message')}</Text>
        </View>

        {onSendKudos && (
          <TouchableOpacity style={styles.kudosButton} onPress={handleSendKudos}>
            <Ionicons name="sparkles" size={16} color={colors.highlight} />
          </TouchableOpacity>
        )}
      </View>

      {showSparkle && (
        <Animated.View
          style={[
            styles.sparkle,
            {
              opacity: sparkleAnim,
              transform: [
                { scale: sparkleAnim },
                { translateY: Animated.multiply(sparkleAnim, -20) },
              ],
            },
          ]}
        >
          <Text style={styles.sparkleText}>✨</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    position: 'relative',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulsingDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27AE60',
  },
  textContainer: {
    flex: 1,
  },
  count: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  kudosButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
  },
  sparkleText: {
    fontSize: 24,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  compactDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#27AE60',
  },
  compactText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  sparkleCompact: {
    marginLeft: spacing.xs,
  },
});
