import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows, animation } from '../styles/theme';
import haptic from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  color?: string;
  hapticFeedback?: boolean;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  color,
  hapticFeedback = true,
  animated = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (animated && onPress) {
      scale.value = withSpring(0.98, animation.spring);
      opacity.value = withTiming(0.9, { duration: animation.fast });
    }
  };

  const handlePressOut = () => {
    if (animated && onPress) {
      scale.value = withSpring(1, animation.spring);
      opacity.value = withTiming(1, { duration: animation.fast });
    }
  };

  const handlePress = () => {
    if (hapticFeedback && onPress) {
      haptic.light();
    }
    onPress?.();
  };

  const cardStyle = [
    styles.card,
    variant === 'elevated' && styles.elevated,
    variant === 'outlined' && styles.outlined,
    variant === 'filled' && color && { backgroundColor: color },
    color && variant !== 'filled' && { borderLeftWidth: 4, borderLeftColor: color },
    style,
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        style={[cardStyle, animatedStyle]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <Animated.View style={[cardStyle, animated && animatedStyle]}>{children}</Animated.View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginVertical: spacing.sm,
  },
  elevated: {
    ...shadows.md,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.backgroundDark,
  },
});
