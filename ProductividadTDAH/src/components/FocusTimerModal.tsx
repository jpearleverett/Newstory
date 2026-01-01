import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface FocusTimerModalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
  onBodyDoubling?: () => void;
}

const { width } = Dimensions.get('window');
const HEARTBEAT_INTERVAL = 5 * 60; // Every 5 minutes

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  visible,
  onClose,
  projectName,
  onBodyDoubling,
}) => {
  const { t } = useLanguage();
  const INITIAL_TIME = 25 * 60;
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [isActive, setIsActive] = useState(false);
  const [focusingCount, setFocusingCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatTime = useRef(INITIAL_TIME);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      setTimeLeft(INITIAL_TIME);
      setIsActive(false);
      lastHeartbeatTime.current = INITIAL_TIME;

      // Simulate body doubling count
      const baseCount = 300 + Math.floor(Math.random() * 200);
      setFocusingCount(baseCount);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      // Check for heartbeat trigger every second (based on time elapsed)
      const elapsedSinceHeartbeat = lastHeartbeatTime.current - timeLeft;
      if (elapsedSinceHeartbeat >= HEARTBEAT_INTERVAL) {
        triggerHeartbeat();
        lastHeartbeatTime.current = timeLeft;
      }
    } else if (timeLeft === 0) {
      setIsActive(false);
      haptic.success();
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  // Heartbeat animation and haptic feedback
  const triggerHeartbeat = () => {
    // Gentle haptic pulse (like a heartbeat)
    haptic.light();
    setTimeout(() => haptic.light(), 150); // Second beat

    // Visual pulse animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.delay(100),
      Animated.timing(pulseAnim, {
        toValue: 1.03,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleTimer = () => {
    haptic.selection();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    haptic.light();
    setIsActive(false);
    setTimeLeft(INITIAL_TIME);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / INITIAL_TIME;
  
  // Dynamic color based on progress
  const getProgressColor = () => {
    if (progress > 0.6) return colors.success; // Green > 60%
    if (progress > 0.3) return colors.warning; // Yellow > 30%
    return colors.error; // Red < 30%
  };

  const currentColor = getProgressColor();

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <StatusBar hidden={true} />
      <View style={[styles.container, { backgroundColor: '#121212' }]}> {/* Immersive Dark Mode */}
        
        {/* Top Controls */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="chevron-down" size={32} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('focus_mode')}</Text>
          <View style={{ width: 32 }} /> 
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.projectName} numberOfLines={2}>
            {projectName || t('focus_default_task')}
          </Text>
          
          {/* Visual Timer Indicator with Pulse Animation */}
          <Animated.View
            style={[
              styles.timerContainer,
              { borderColor: currentColor, transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={[styles.timerText, { color: currentColor }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.statusText}>
              {isActive ? t('focusing') : t('paused')}
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: currentColor
                }
              ]} 
            />
          </View>

          {/* Controls */}
          <View style={styles.controls}>
             <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Ionicons name="refresh" size={28} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.playBtn, { backgroundColor: isActive ? colors.textMuted : currentColor }]} 
                onPress={toggleTimer}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={48} color={isActive ? '#121212' : colors.white} />
            </TouchableOpacity>
            
            <View style={{ width: 48 }} /> {/* Spacer for balance */}
          </View>
        </View>

        {/* Motivational Tip & Body Doubling */}
        <View style={styles.footer}>
          {/* Body Doubling Counter */}
          <View style={styles.bodyDoublingContainer}>
            <View style={styles.bodyDoublingDot} />
            <Text style={styles.bodyDoublingText}>
              {focusingCount.toLocaleString()} {t('focus_body_doubling')}
            </Text>
          </View>

          <Text style={styles.tipText}>
            {isActive ? t('focus_breath') : t('focus_ready')}
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  headerTitle: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectName: {
    fontSize: fontSize.xl,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    opacity: 0.9,
    fontWeight: fontWeight.bold,
  },
  timerContainer: {
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
    borderWidth: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: '#1E1E1E',
  },
  timerText: {
    fontSize: 72,
    fontWeight: fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  statusText: {
    color: colors.textMuted,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: fontSize.sm,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: borderRadius.round,
    marginBottom: spacing.xxl,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.round,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    width: '100%',
  },
  playBtn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.lg,
  },
  resetBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  bodyDoublingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  bodyDoublingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#27AE60',
  },
  bodyDoublingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: fontSize.sm,
  },
  tipText: {
    color: colors.textMuted,
    fontSize: fontSize.md,
    fontStyle: 'italic',
  },
});
