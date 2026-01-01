import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface ImpulsePauseModalProps {
  visible: boolean;
  onClose: () => void;
  onScheduleReminder: (item: string) => void;
  onProceed: (item: string, isNeed: boolean) => void;
}

type Step = 'item' | 'feeling' | 'wait' | 'result';

const { width } = Dimensions.get('window');

const FEELINGS = [
  { id: 'bored', emoji: '😐', labelKey: 'impulse_feeling_bored' },
  { id: 'sad', emoji: '😢', labelKey: 'impulse_feeling_sad' },
  { id: 'stressed', emoji: '😰', labelKey: 'impulse_feeling_stressed' },
  { id: 'happy', emoji: '😊', labelKey: 'impulse_feeling_happy' },
  { id: 'tired', emoji: '😴', labelKey: 'impulse_feeling_tired' },
  { id: 'excited', emoji: '🤩', labelKey: 'impulse_feeling_excited' },
];

export const ImpulsePauseModal: React.FC<ImpulsePauseModalProps> = ({
  visible,
  onClose,
  onScheduleReminder,
  onProceed,
}) => {
  const { t } = useLanguage();
  const [step, setStep] = useState<Step>('item');
  const [item, setItem] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [canWait, setCanWait] = useState<boolean | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      resetState();
      animateIn();
    }
  }, [visible]);

  useEffect(() => {
    // Animate progress bar based on step
    const stepProgress = { item: 0, feeling: 0.33, wait: 0.66, result: 1 };
    Animated.spring(progressAnim, {
      toValue: stepProgress[step],
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const resetState = () => {
    setStep('item');
    setItem('');
    setSelectedFeeling(null);
    setCanWait(null);
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
  };

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    haptic.selection();
    if (step === 'item' && item.trim()) {
      setStep('feeling');
    } else if (step === 'feeling' && selectedFeeling) {
      setStep('wait');
    } else if (step === 'wait' && canWait !== null) {
      setStep('result');
    }
  };

  const handleFeelingSelect = (feelingId: string) => {
    haptic.light();
    setSelectedFeeling(feelingId);
  };

  const handleWaitDecision = (decision: boolean) => {
    haptic.medium();
    setCanWait(decision);
    setStep('result');
  };

  const handleSchedule = () => {
    haptic.success();
    onScheduleReminder(item);
    onClose();
  };

  const handleProceedAnyway = () => {
    haptic.light();
    // If they're feeling negative emotions and can't wait, likely an impulse
    const isNeed = selectedFeeling === 'happy' || selectedFeeling === 'excited';
    onProceed(item, isNeed);
    onClose();
  };

  const isEmotionalSpending = ['bored', 'sad', 'stressed', 'tired'].includes(selectedFeeling || '');

  const renderStep = () => {
    switch (step) {
      case 'item':
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="cart-outline" size={40} color={colors.primary} />
            </View>
            <Text style={styles.stepTitle}>{t('impulse_step1_title')}</Text>
            <Text style={styles.stepSubtitle}>{t('impulse_step1_subtitle')}</Text>

            <TextInput
              style={styles.input}
              placeholder={t('impulse_item_placeholder')}
              placeholderTextColor={colors.textMuted}
              value={item}
              onChangeText={setItem}
              autoFocus
            />

            <TouchableOpacity
              style={[styles.nextButton, !item.trim() && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!item.trim()}
            >
              <Text style={styles.nextButtonText}>{t('impulse_next')}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        );

      case 'feeling':
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart-outline" size={40} color={colors.pink} />
            </View>
            <Text style={styles.stepTitle}>{t('impulse_step2_title')}</Text>
            <Text style={styles.stepSubtitle}>{t('impulse_step2_subtitle')}</Text>

            <View style={styles.feelingsGrid}>
              {FEELINGS.map((feeling) => (
                <TouchableOpacity
                  key={feeling.id}
                  style={[
                    styles.feelingButton,
                    selectedFeeling === feeling.id && styles.feelingButtonSelected,
                  ]}
                  onPress={() => handleFeelingSelect(feeling.id)}
                >
                  <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
                  <Text style={[
                    styles.feelingLabel,
                    selectedFeeling === feeling.id && styles.feelingLabelSelected,
                  ]}>
                    {t(feeling.labelKey as any)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.nextButton, !selectedFeeling && styles.nextButtonDisabled]}
              onPress={handleNext}
              disabled={!selectedFeeling}
            >
              <Text style={styles.nextButtonText}>{t('impulse_next')}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </TouchableOpacity>
          </Animated.View>
        );

      case 'wait':
        return (
          <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={40} color={colors.accent} />
            </View>
            <Text style={styles.stepTitle}>{t('impulse_step3_title')}</Text>
            <Text style={styles.stepSubtitle}>
              {isEmotionalSpending
                ? t('impulse_step3_emotional_warning')
                : t('impulse_step3_subtitle')}
            </Text>

            <View style={styles.waitButtons}>
              <TouchableOpacity
                style={[styles.waitButton, styles.waitButtonYes]}
                onPress={() => handleWaitDecision(true)}
              >
                <Ionicons name="checkmark-circle" size={32} color={colors.primary} />
                <Text style={styles.waitButtonText}>{t('impulse_can_wait')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.waitButton, styles.waitButtonNo]}
                onPress={() => handleWaitDecision(false)}
              >
                <Ionicons name="close-circle" size={32} color={colors.error} />
                <Text style={styles.waitButtonText}>{t('impulse_cant_wait')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        );

      case 'result':
        if (canWait) {
          return (
            <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
                <Ionicons name="sparkles" size={40} color={colors.white} />
              </View>
              <Text style={styles.stepTitle}>{t('impulse_result_wait_title')}</Text>
              <Text style={styles.stepSubtitle}>{t('impulse_result_wait_subtitle')}</Text>

              <View style={styles.resultCard}>
                <Ionicons name="notifications-outline" size={24} color={colors.primary} />
                <Text style={styles.resultCardText}>
                  {t('impulse_reminder_text', { item })}
                </Text>
              </View>

              <TouchableOpacity style={styles.scheduleButton} onPress={handleSchedule}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.scheduleGradient}
                >
                  <Ionicons name="alarm-outline" size={24} color={colors.white} />
                  <Text style={styles.scheduleButtonText}>{t('impulse_schedule_reminder')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={onClose}>
                <Text style={styles.skipButtonText}>{t('impulse_skip_reminder')}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        } else {
          return (
            <Animated.View style={[styles.stepContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              <View style={[styles.iconCircle, styles.iconCircleWarning]}>
                <Ionicons name="warning-outline" size={40} color={colors.white} />
              </View>
              <Text style={styles.stepTitle}>{t('impulse_result_now_title')}</Text>
              <Text style={styles.stepSubtitle}>
                {isEmotionalSpending
                  ? t('impulse_result_emotional')
                  : t('impulse_result_now_subtitle')}
              </Text>

              {isEmotionalSpending && (
                <View style={styles.warningCard}>
                  <Text style={styles.warningText}>{t('impulse_emotional_warning')}</Text>
                </View>
              )}

              <TouchableOpacity style={styles.proceedButton} onPress={handleProceedAnyway}>
                <Text style={styles.proceedButtonText}>{t('impulse_proceed_anyway')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.reconsiderButton} onPress={() => handleWaitDecision(true)}>
                <Ionicons name="refresh" size={20} color={colors.primary} />
                <Text style={styles.reconsiderButtonText}>{t('impulse_reconsider')}</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <StatusBar barStyle="light-content" />
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('impulse_title')}</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>

          {/* Step Content */}
          {renderStep()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingBottom: spacing.xxl,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  progressContainer: {
    height: 4,
    backgroundColor: colors.backgroundDark,
    marginHorizontal: spacing.lg,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  stepContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconCircleSuccess: {
    backgroundColor: colors.primary,
  },
  iconCircleWarning: {
    backgroundColor: colors.warning,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  input: {
    width: '100%',
    backgroundColor: colors.backgroundLight,
    borderWidth: 1,
    borderColor: colors.backgroundDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  nextButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  feelingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  feelingButton: {
    width: (width - spacing.lg * 4) / 3,
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  feelingButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  feelingEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  feelingLabel: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  feelingLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  waitButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  waitButton: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  waitButtonYes: {
    backgroundColor: colors.successLight,
  },
  waitButtonNo: {
    backgroundColor: colors.errorLight,
  },
  waitButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryMuted,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
    width: '100%',
  },
  resultCardText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.primary,
  },
  scheduleButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  scheduleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  scheduleButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  skipButton: {
    padding: spacing.md,
  },
  skipButtonText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
  },
  warningCard: {
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    width: '100%',
  },
  warningText: {
    fontSize: fontSize.sm,
    color: colors.warning,
    textAlign: 'center',
  },
  proceedButton: {
    backgroundColor: colors.textMuted,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  proceedButtonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  reconsiderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  reconsiderButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});
