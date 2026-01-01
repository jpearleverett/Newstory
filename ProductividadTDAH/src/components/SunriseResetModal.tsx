import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import haptic from '../utils/haptics';

interface SunriseResetModalProps {
  visible: boolean;
  backlogCount: number;
  onReset: () => void;
  onViewBacklog: () => void;
}

const { width, height } = Dimensions.get('window');

export const SunriseResetModal: React.FC<SunriseResetModalProps> = ({
  visible,
  backlogCount,
  onReset,
  onViewBacklog,
}) => {
  const { t } = useLanguage();
  const sunAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(30)).current;
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (visible) {
      // Sunrise animation sequence
      setShowContent(false);
      sunAnim.setValue(height * 0.4);
      fadeAnim.setValue(0);
      textAnim.setValue(30);

      // Sun rising
      Animated.sequence([
        Animated.timing(sunAnim, {
          toValue: height * 0.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.delay(300),
      ]).start(() => {
        setShowContent(true);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(textAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [visible]);

  const handleReset = () => {
    haptic.success();
    onReset();
  };

  const handleViewBacklog = () => {
    haptic.medium();
    onViewBacklog();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient
        colors={['#1a1a2e', '#2d3436', '#fab1a0', '#ffeaa7', '#FAF9F6']}
        locations={[0, 0.15, 0.4, 0.7, 1]}
        style={styles.container}
      >
        {/* Animated Sun */}
        <Animated.View
          style={[
            styles.sunContainer,
            { transform: [{ translateY: sunAnim }] },
          ]}
        >
          <View style={styles.sun}>
            <View style={styles.sunCore} />
          </View>
          {/* Sun rays */}
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.sunRay,
                {
                  transform: [
                    { rotate: `${i * 45}deg` },
                    { translateY: -90 },
                  ],
                },
              ]}
            />
          ))}
        </Animated.View>

        {/* Hills silhouette */}
        <View style={styles.hillsContainer}>
          <View style={[styles.hill, styles.hillLeft]} />
          <View style={[styles.hill, styles.hillRight]} />
          <View style={[styles.hill, styles.hillCenter]} />
        </View>

        {/* Content */}
        {showContent && (
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: textAnim }],
              },
            ]}
          >
            <Text style={styles.welcomeBack}>{t('sunrise_welcome_back')}</Text>
            <Text style={styles.message}>{t('sunrise_message')}</Text>

            {backlogCount > 0 && (
              <View style={styles.backlogInfo}>
                <Ionicons name="archive-outline" size={20} color={colors.textLight} />
                <Text style={styles.backlogText}>
                  {t('sunrise_backlog_count', { count: backlogCount })}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.resetGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="sunny" size={24} color={colors.white} />
                <Text style={styles.resetText}>{t('sunrise_fresh_start')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            {backlogCount > 0 && (
              <TouchableOpacity style={styles.backlogButton} onPress={handleViewBacklog}>
                <Text style={styles.backlogButtonText}>{t('sunrise_view_backlog')}</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.compassionateMessage}>
              {t('sunrise_compassionate')}
            </Text>
          </Animated.View>
        )}
      </LinearGradient>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sunContainer: {
    position: 'absolute',
    left: width / 2 - 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sun: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffeaa7',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xl,
    shadowColor: '#f39c12',
  },
  sunCore: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fdcb6e',
  },
  sunRay: {
    position: 'absolute',
    width: 4,
    height: 30,
    backgroundColor: '#ffeaa7',
    borderRadius: 2,
  },
  hillsContainer: {
    position: 'absolute',
    bottom: height * 0.35,
    left: 0,
    right: 0,
    height: 100,
  },
  hill: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#2d3436',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
  },
  hillLeft: {
    left: -50,
    width: 200,
    height: 80,
    opacity: 0.3,
  },
  hillRight: {
    right: -50,
    width: 250,
    height: 100,
    opacity: 0.3,
  },
  hillCenter: {
    left: width / 2 - 150,
    width: 300,
    height: 120,
    opacity: 0.2,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
    ...shadows.xl,
  },
  welcomeBack: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textDark,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  backlogInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundDark,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  backlogText: {
    fontSize: fontSize.sm,
    color: colors.textLight,
  },
  resetButton: {
    width: '100%',
    marginBottom: spacing.md,
  },
  resetGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  resetText: {
    color: colors.white,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  backlogButton: {
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  backlogButtonText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  compassionateMessage: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
