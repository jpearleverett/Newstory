import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface SimplifierChallengeModalProps {
  visible: boolean;
  onClose: () => void;
  currentDay: number;
  completedDays: number[];
  onCompleteDay: (day: number) => void;
}

const { width, height } = Dimensions.get('window');

// 30 micro-missions for home simplification
const CHALLENGES = [
  { day: 1, icon: '🍱', taskKey: 'simplifier_day1' }, // Match Tupperware lids
  { day: 2, icon: '🧦', taskKey: 'simplifier_day2' }, // Pair lonely socks
  { day: 3, icon: '💊', taskKey: 'simplifier_day3' }, // Check expired meds
  { day: 4, icon: '🧴', taskKey: 'simplifier_day4' }, // Toss empty bottles
  { day: 5, icon: '📧', taskKey: 'simplifier_day5' }, // Unsubscribe 5 emails
  { day: 6, icon: '🧲', taskKey: 'simplifier_day6' }, // Clear fridge magnets
  { day: 7, icon: '📱', taskKey: 'simplifier_day7' }, // Delete unused apps
  { day: 8, icon: '🖊️', taskKey: 'simplifier_day8' }, // Test all pens
  { day: 9, icon: '📦', taskKey: 'simplifier_day9' }, // Flatten cardboard
  { day: 10, icon: '🧹', taskKey: 'simplifier_day10' }, // One drawer clean
  { day: 11, icon: '👕', taskKey: 'simplifier_day11' }, // Remove 3 old clothes
  { day: 12, icon: '📚', taskKey: 'simplifier_day12' }, // Stack unread books
  { day: 13, icon: '🔌', taskKey: 'simplifier_day13' }, // Untangle cords
  { day: 14, icon: '🛁', taskKey: 'simplifier_day14' }, // Organize one shelf
  { day: 15, icon: '🗂️', taskKey: 'simplifier_day15' }, // Sort one paper pile
  { day: 16, icon: '🧊', taskKey: 'simplifier_day16' }, // Clear freezer mystery items
  { day: 17, icon: '👜', taskKey: 'simplifier_day17' }, // Empty one bag/purse
  { day: 18, icon: '🪴', taskKey: 'simplifier_day18' }, // Water/toss dead plants
  { day: 19, icon: '💄', taskKey: 'simplifier_day19' }, // Check expired makeup
  { day: 20, icon: '🧽', taskKey: 'simplifier_day20' }, // Replace old sponges
  { day: 21, icon: '📷', taskKey: 'simplifier_day21' }, // Delete 10 phone photos
  { day: 22, icon: '🧥', taskKey: 'simplifier_day22' }, // Check coat pockets
  { day: 23, icon: '🔋', taskKey: 'simplifier_day23' }, // Test batteries
  { day: 24, icon: '🧹', taskKey: 'simplifier_day24' }, // Clean one surface
  { day: 25, icon: '📬', taskKey: 'simplifier_day25' }, // Process mail pile
  { day: 26, icon: '🎮', taskKey: 'simplifier_day26' }, // Organize game/hobby area
  { day: 27, icon: '🛏️', taskKey: 'simplifier_day27' }, // Under bed check
  { day: 28, icon: '🚗', taskKey: 'simplifier_day28' }, // Car quick clean
  { day: 29, icon: '📋', taskKey: 'simplifier_day29' }, // Update important list
  { day: 30, icon: '🎉', taskKey: 'simplifier_day30' }, // Celebrate & plan next
];

// Simple confetti particle component
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value((Math.random() - 0.5) * width)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height,
        duration: 2000 + Math.random() * 1000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: 360 * (Math.random() > 0.5 ? 1 : -1),
        duration: 2000,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 2000,
        delay: delay + 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: width / 2,
        top: 0,
        width: 10,
        height: 10,
        backgroundColor: color,
        borderRadius: 2,
        transform: [
          { translateY },
          { translateX },
          { rotate: rotate.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
          })},
        ],
        opacity,
      }}
    />
  );
};

export const SimplifierChallengeModal: React.FC<SimplifierChallengeModalProps> = ({
  visible,
  onClose,
  currentDay,
  completedDays,
  onCompleteDay,
}) => {
  const { t } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const confettiColors = [colors.primary, colors.accent, colors.pink, colors.highlight];

  useEffect(() => {
    if (visible) {
      setSelectedDay(currentDay);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0.8);
      fadeAnim.setValue(0);
      setShowConfetti(false);
    }
  }, [visible]);

  const todayChallenge = CHALLENGES.find(c => c.day === selectedDay) || CHALLENGES[0];
  const isCompleted = completedDays.includes(selectedDay);
  const completionPercent = Math.round((completedDays.length / 30) * 100);

  const handleComplete = () => {
    if (!isCompleted) {
      haptic.success();

      // Bounce animation
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.2,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Show confetti with new key to reset particles
      setConfettiKey(prev => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      onCompleteDay(selectedDay);
    }
  };

  const handleDaySelect = (day: number) => {
    haptic.selection();
    setSelectedDay(day);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>{t('simplifier_title')}</Text>
              <Text style={styles.headerSubtitle}>{t('simplifier_subtitle')}</Text>
            </View>

            {/* Progress Circle */}
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>{completionPercent}%</Text>
            </View>
          </LinearGradient>

          {/* Today's Challenge */}
          <Animated.View style={[styles.challengeCard, { transform: [{ scale: bounceAnim }] }]}>
            <View style={styles.dayBadge}>
              <Text style={styles.dayBadgeText}>{t('simplifier_day', { day: selectedDay })}</Text>
            </View>

            <Text style={styles.challengeEmoji}>{todayChallenge.icon}</Text>
            <Text style={styles.challengeTitle}>{t(todayChallenge.taskKey as any)}</Text>

            {isCompleted ? (
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                <Text style={styles.completedText}>{t('simplifier_completed')}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.completeGradient}
                >
                  <Ionicons name="checkmark" size={24} color={colors.white} />
                  <Text style={styles.completeButtonText}>{t('simplifier_mark_done')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Calendar View */}
          <Text style={styles.calendarTitle}>{t('simplifier_your_journey')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarContainer}
          >
            {CHALLENGES.map((challenge) => {
              const isDone = completedDays.includes(challenge.day);
              const isToday = challenge.day === currentDay;
              const isSelected = challenge.day === selectedDay;

              return (
                <TouchableOpacity
                  key={challenge.day}
                  style={[
                    styles.calendarDay,
                    isDone && styles.calendarDayDone,
                    isToday && styles.calendarDayToday,
                    isSelected && styles.calendarDaySelected,
                  ]}
                  onPress={() => handleDaySelect(challenge.day)}
                >
                  <Text style={[
                    styles.calendarDayNumber,
                    isDone && styles.calendarDayNumberDone,
                    isSelected && styles.calendarDayNumberSelected,
                  ]}>
                    {challenge.day}
                  </Text>
                  {isDone && (
                    <Ionicons name="checkmark" size={12} color={colors.white} style={styles.calendarCheck} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Motivational Message */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationEmoji}>💪</Text>
            <Text style={styles.motivationText}>
              {completedDays.length === 0
                ? t('simplifier_motivation_start')
                : completedDays.length < 10
                ? t('simplifier_motivation_early')
                : completedDays.length < 20
                ? t('simplifier_motivation_middle')
                : t('simplifier_motivation_final')}
            </Text>
          </View>
        </Animated.View>

        {/* Confetti */}
        {showConfetti && (
          <View key={confettiKey} style={StyleSheet.absoluteFill} pointerEvents="none">
            {Array.from({ length: 50 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 30}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
    maxHeight: height * 0.85,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  headerContent: {
    marginRight: 60,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressCircle: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercent: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  challengeCard: {
    margin: spacing.lg,
    marginTop: -spacing.xl,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  dayBadge: {
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
  },
  dayBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  challengeEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  challengeTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
  },
  completedText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  completeButton: {
    width: '100%',
  },
  completeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  calendarTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  calendarContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  calendarDay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    position: 'relative',
  },
  calendarDayDone: {
    backgroundColor: colors.primary,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: colors.accent,
  },
  calendarDaySelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDayNumber: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textLight,
  },
  calendarDayNumberDone: {
    color: colors.white,
  },
  calendarDayNumberSelected: {
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  calendarCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.highlightLight,
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  motivationEmoji: {
    fontSize: 24,
  },
  motivationText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textDark,
    fontStyle: 'italic',
  },
});
