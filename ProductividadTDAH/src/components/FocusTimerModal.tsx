import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { Button } from './Button';
import haptic from '../utils/haptics';

interface FocusTimerModalProps {
  visible: boolean;
  onClose: () => void;
  projectName: string;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({ visible, onClose, projectName }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible) {
      // Reset when opening
      setTimeLeft(25 * 60);
      setIsActive(false);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [visible]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      haptic.success();
      if (intervalRef.current) clearInterval(intervalRef.current);
    } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    haptic.selection();
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    haptic.light();
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / (25 * 60);

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.projectName} numberOfLines={1}>{projectName}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            <Text style={styles.statusText}>{isActive ? 'Enfocando...' : 'Pausado'}</Text>
          </View>

          {/* Progress Bar Background */}
          <View style={styles.progressContainer}>
             <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>

          <View style={styles.controls}>
            <TouchableOpacity 
                style={[styles.controlBtn, isActive ? styles.pauseBtn : styles.playBtn]} 
                onPress={toggleTimer}
            >
              <Ionicons name={isActive ? "pause" : "play"} size={32} color={colors.white} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
              <Ionicons name="refresh" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.tipText}>
              "No tienes que terminarlo todo, solo trabaja estos 25 minutos."
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)', // Darker overlay for focus
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  container: {
    width: '100%',
    backgroundColor: colors.backgroundDark, // Slightly darker bg
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.lg,
  },
  header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      marginBottom: spacing.xl,
  },
  projectName: {
      fontSize: fontSize.lg,
      color: colors.text,
      fontWeight: fontWeight.bold,
      flex: 1,
      marginRight: spacing.md,
  },
  closeBtn: {
      backgroundColor: colors.textLight,
      borderRadius: borderRadius.round,
      padding: 4,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    backgroundColor: colors.white,
  },
  timerText: {
    fontSize: 48,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    fontVariant: ['tabular-nums'],
  },
  statusText: {
      fontSize: fontSize.sm,
      color: colors.textLight,
      marginTop: spacing.xs,
      textTransform: 'uppercase',
      letterSpacing: 1,
  },
  progressContainer: {
      width: '100%',
      height: 6,
      backgroundColor: colors.backgroundMuted,
      borderRadius: borderRadius.round,
      marginBottom: spacing.xl,
      overflow: 'hidden',
  },
  progressBar: {
      height: '100%',
      backgroundColor: colors.primary,
  },
  controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xl,
      marginBottom: spacing.lg,
  },
  controlBtn: {
      width: 72,
      height: 72,
      borderRadius: 36,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.md,
  },
  playBtn: {
      backgroundColor: colors.primary,
  },
  pauseBtn: {
      backgroundColor: colors.orange,
  },
  resetBtn: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.textLight,
      justifyContent: 'center',
      alignItems: 'center',
  },
  tipText: {
      textAlign: 'center',
      color: colors.textLight,
      fontStyle: 'italic',
      marginTop: spacing.md,
  }
});
