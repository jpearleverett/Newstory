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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import { ManifestationEntry } from '../context/DataContext';
import haptic from '../utils/haptics';

interface ManifestationModalProps {
  visible: boolean;
  onClose: () => void;
  manifestation: ManifestationEntry | undefined;
  onSetIntention: (intention: string) => void;
  onIncrement: (period: 'morning' | 'afternoon' | 'evening') => void;
}

const { width } = Dimensions.get('window');

export const ManifestationModal: React.FC<ManifestationModalProps> = ({
  visible,
  onClose,
  manifestation,
  onSetIntention,
  onIncrement,
}) => {
  const { t } = useLanguage();
  const [intention, setIntention] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const currentPeriod = getCurrentPeriod();
  const targetCount = currentPeriod === 'morning' ? 3 : currentPeriod === 'afternoon' ? 6 : 9;
  const currentCount = manifestation
    ? manifestation[`${currentPeriod}Count` as keyof ManifestationEntry] as number
    : 0;

  useEffect(() => {
    if (visible) {
      if (manifestation) {
        setIntention(manifestation.intention);
        setIsEditing(false);
      } else {
        setIntention('');
        setIsEditing(true);
      }
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
      scaleAnim.setValue(0.9);
      fadeAnim.setValue(0);
    }
  }, [visible, manifestation]);

  function getCurrentPeriod(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }

  const handleSaveIntention = () => {
    if (intention.trim()) {
      haptic.success();
      onSetIntention(intention.trim());
      setIsEditing(false);
    }
  };

  const handleIncrement = () => {
    if (currentCount < targetCount) {
      haptic.medium();
      onIncrement(currentPeriod);
    } else {
      haptic.success();
    }
  };

  const renderProgressCircles = () => {
    const circles = [];
    for (let i = 0; i < targetCount; i++) {
      const isFilled = i < currentCount;
      circles.push(
        <View
          key={i}
          style={[
            styles.progressCircle,
            isFilled && styles.progressCircleFilled,
          ]}
        >
          {isFilled && (
            <Ionicons name="checkmark" size={12} color={colors.white} />
          )}
        </View>
      );
    }
    return circles;
  };

  const getPeriodEmoji = () => {
    switch (currentPeriod) {
      case 'morning':
        return '🌅';
      case 'afternoon':
        return '☀️';
      case 'evening':
        return '🌙';
    }
  };

  const isComplete = currentCount >= targetCount;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.title}>{t('manifestation_title')}</Text>
            <Text style={styles.subtitle}>{t('manifestation_subtitle')}</Text>
            <Text style={styles.periodBadge}>
              {getPeriodEmoji()} {t(`manifestation_${currentPeriod}`)} ({targetCount}x)
            </Text>
          </LinearGradient>

          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {/* Intention Section */}
            <View style={styles.intentionSection}>
              <Text style={styles.sectionLabel}>{t('manifestation_intention_label')}</Text>

              {isEditing ? (
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.intentionInput}
                    value={intention}
                    onChangeText={setIntention}
                    placeholder={t('manifestation_placeholder')}
                    placeholderTextColor={colors.textMuted}
                    multiline
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[
                      styles.saveButton,
                      !intention.trim() && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSaveIntention}
                    disabled={!intention.trim()}
                  >
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={intention.trim() ? colors.white : colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.intentionDisplay}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.intentionText}>{intention}</Text>
                  <Ionicons name="pencil" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Progress Section */}
            {!isEditing && manifestation && (
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>
                  {t('manifestation_progress', {
                    current: currentCount,
                    target: targetCount,
                  })}
                </Text>

                <View style={styles.progressCircles}>
                  {renderProgressCircles()}
                </View>

                {!isComplete ? (
                  <TouchableOpacity
                    style={styles.affirmButton}
                    onPress={handleIncrement}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.affirmGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Ionicons name="add" size={24} color={colors.white} />
                      <Text style={styles.affirmText}>
                        {t('manifestation_affirm')}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.completeSection}>
                    <Text style={styles.completeEmoji}>✨</Text>
                    <Text style={styles.completeText}>
                      {t('manifestation_complete')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Instructions */}
            <View style={styles.instructionsSection}>
              <Text style={styles.instructionsTitle}>{t('manifestation_how')}</Text>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>3</Text>
                <Text style={styles.instructionText}>{t('manifestation_morning_instruction')}</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>6</Text>
                <Text style={styles.instructionText}>{t('manifestation_afternoon_instruction')}</Text>
              </View>
              <View style={styles.instructionItem}>
                <Text style={styles.instructionNumber}>9</Text>
                <Text style={styles.instructionText}>{t('manifestation_evening_instruction')}</Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    width: width - spacing.xl * 2,
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.xl,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    padding: spacing.xs,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: spacing.sm,
  },
  periodBadge: {
    fontSize: fontSize.md,
    color: colors.white,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  content: {
    padding: spacing.lg,
  },
  intentionSection: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textLight,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  intentionInput: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.backgroundDark,
  },
  intentionDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  intentionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontSize: fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.md,
  },
  progressCircles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  progressCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  affirmButton: {
    width: '100%',
  },
  affirmGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  affirmText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  completeSection: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  completeEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  completeText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  instructionsSection: {
    backgroundColor: colors.backgroundDark,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  instructionsTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textDark,
    marginBottom: spacing.md,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
});
