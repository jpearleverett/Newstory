import React, { ReactNode, useRef } from 'react';
import { View, StyleSheet, ViewStyle, Pressable, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows, animation, glowShadow } from '../styles/theme';
import haptic from '../utils/haptics';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled' | 'gradient';
  color?: string;
  gradientColors?: [string, string, ...string[]];
  hapticFeedback?: boolean;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  color,
  gradientColors,
  hapticFeedback = true,
  animated = true,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.96,
          useNativeDriver: true,
          damping: 15,
          stiffness: 300,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: animation.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          damping: 15,
          stiffness: 300,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: animation.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePress = () => {
    if (hapticFeedback && onPress) {
      haptic.light();
    }
    onPress?.();
  };

  // Base style
  const cardContainerStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && color && { backgroundColor: color },
    // If it's a gradient, we don't set background color here
    style,
  ];

  // Apply specific glow if elevated and color is provided
  if (variant === 'elevated' && color) {
    cardContainerStyle.push(glowShadow(color, 0.2));
  }

  // Border accents
  const contentStyle = [
    color && variant === 'default' && { borderLeftWidth: 4, borderLeftColor: color },
    variant === 'gradient' && { padding: spacing.lg }, // Padding inside gradient
    variant !== 'gradient' && { padding: 0 } // Reset padding for wrapper if not gradient
  ];

  const renderContent = () => {
    if (variant === 'gradient' && gradientColors) {
      return (
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { padding: spacing.lg }]}
        >
          {children}
        </LinearGradient>
      );
    }
    return <View style={styles.content}>{children}</View>;
  };

  const AnimatedComponent = onPress ? Animated.createAnimatedComponent(Pressable) : View;

  return (
    <AnimatedComponent
      onPress={onPress ? handlePress : undefined}
      onPressIn={onPress ? handlePressIn : undefined}
      onPressOut={onPress ? handlePressOut : undefined}
      style={[
        cardContainerStyle,
        onPress && {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
        {renderContent()}
    </AnimatedComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    marginVertical: spacing.sm,
    overflow: 'hidden', // Ensure gradient stays inside
    // Default shadow
    ...shadows.sm,
  },
  content: {
    padding: spacing.lg,
  },
  elevated: {
    ...shadows.lg,
    backgroundColor: colors.backgroundLight, // Ensure background for shadow
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.backgroundDark,
    ...shadows.none,
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
});
