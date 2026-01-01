import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface EnergyCheckModalProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (energyLevel: number) => void;
}

const { width, height } = Dimensions.get('window');
const SLIDER_WIDTH = width * 0.8;
const THUMB_SIZE = 60;

export const EnergyCheckModal: React.FC<EnergyCheckModalProps> = ({
  visible,
  onClose,
  onComplete,
}) => {
  const { t } = useLanguage();
  const [energyLevel, setEnergyLevel] = useState(50);
  const translateX = useRef(new Animated.Value(SLIDER_WIDTH * 0.5 - THUMB_SIZE / 2)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      setEnergyLevel(50);
      translateX.setValue(SLIDER_WIDTH * 0.5 - THUMB_SIZE / 2);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.8);
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        haptic.light();
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, Math.min(gestureState.moveX - (width - SLIDER_WIDTH) / 2 - THUMB_SIZE / 2, SLIDER_WIDTH - THUMB_SIZE));
        translateX.setValue(newX);
        const newLevel = Math.round((newX / (SLIDER_WIDTH - THUMB_SIZE)) * 100);
        if (newLevel !== energyLevel) {
          setEnergyLevel(newLevel);
          if (newLevel % 10 === 0) {
            haptic.selection();
          }
        }
      },
      onPanResponderRelease: () => {
        haptic.medium();
      },
    })
  ).current;

  const getEnergyMessage = () => {
    if (energyLevel < 30) return t('energy_message_low');
    if (energyLevel < 70) return t('energy_message_medium');
    return t('energy_message_high');
  };

  const getEnergyEmoji = () => {
    if (energyLevel < 20) return '😴';
    if (energyLevel < 40) return '😌';
    if (energyLevel < 60) return '😊';
    if (energyLevel < 80) return '😄';
    return '🔥';
  };

  const handleContinue = () => {
    haptic.success();
    onComplete(energyLevel);
  };

  // Get gradient colors based on energy level
  const getGradientColors = (): [string, string, string] => {
    if (energyLevel < 30) {
      // Low energy - calm, muted night colors
      return ['#1a1a2e', '#16213e', '#0f3460'];
    } else if (energyLevel < 70) {
      // Medium energy - warm morning colors
      return ['#2d3436', '#636e72', '#b2bec3'];
    } else {
      // High energy - vibrant sunrise colors
      return ['#e17055', '#fdcb6e', '#f9ca24'];
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={getGradientColors()}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Skip button */}
          <TouchableOpacity style={styles.skipButton} onPress={onClose}>
            <Text style={styles.skipText}>{t('energy_skip')}</Text>
          </TouchableOpacity>

          {/* Main question */}
          <View style={styles.questionContainer}>
            <Text style={styles.emoji}>{getEnergyEmoji()}</Text>
            <Text style={styles.question}>{t('energy_question')}</Text>
            <Text style={styles.subtitle}>{t('energy_subtitle')}</Text>
          </View>

          {/* Energy Level Display */}
          <View style={styles.levelDisplay}>
            <Text style={styles.levelNumber}>{energyLevel}%</Text>
            <Text style={styles.levelMessage}>{getEnergyMessage()}</Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            {/* Track background */}
            <LinearGradient
              colors={['#E08E55', '#FFD166', '#7A8C5A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sliderTrack}
            />

            {/* Thumb */}
            <Animated.View
              style={[
                styles.thumb,
                {
                  transform: [{ translateX }],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.thumbInner}>
                <Ionicons name="battery-half" size={24} color={colors.primary} />
              </View>
            </Animated.View>
          </View>

          {/* Labels */}
          <View style={styles.labelsContainer}>
            <Text style={styles.label}>{t('energy_low')}</Text>
            <Text style={styles.label}>{t('energy_high')}</Text>
          </View>

          {/* Continue Button */}
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.continueGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.continueText}>{t('energy_continue')}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Compassionate message */}
          <Text style={styles.compassionateText}>
            {t('energy_compassionate')}
          </Text>
        </Animated.View>
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  skipButton: {
    position: 'absolute',
    top: -height * 0.15,
    right: spacing.lg,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.md,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  question: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  levelDisplay: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  levelNumber: {
    fontSize: 64,
    fontWeight: fontWeight.heavy,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  levelMessage: {
    fontSize: fontSize.lg,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xs,
  },
  sliderContainer: {
    width: SLIDER_WIDTH,
    height: THUMB_SIZE,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  sliderTrack: {
    width: '100%',
    height: 12,
    borderRadius: 6,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  thumbInner: {
    width: THUMB_SIZE - 8,
    height: THUMB_SIZE - 8,
    borderRadius: (THUMB_SIZE - 8) / 2,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelsContainer: {
    width: SLIDER_WIDTH,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: fontSize.sm,
  },
  continueButton: {
    width: SLIDER_WIDTH,
    marginBottom: spacing.lg,
  },
  continueGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  continueText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  compassionateText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.xl,
  },
});
