import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, animation } from '../styles/theme';
import haptic from '../utils/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  gradientColors?: [string, string];
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  hapticFeedback?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  color = colors.primary,
  gradientColors,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  hapticFeedback = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, animation.springBouncy);
    opacity.value = withTiming(0.9, { duration: animation.fast });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, animation.spring);
    opacity.value = withTiming(1, { duration: animation.fast });
  };

  const handlePress = () => {
    if (hapticFeedback) {
      haptic.medium();
    }
    onPress();
  };

  const sizeStyles = {
    small: { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md + 4 },
    medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.xl },
    large: { paddingVertical: spacing.lg - 4, paddingHorizontal: spacing.xxl },
  };

  const textSizeStyles = {
    small: { fontSize: fontSize.sm },
    medium: { fontSize: fontSize.md },
    large: { fontSize: fontSize.lg },
  };

  const buttonStyles = [
    styles.base,
    sizeStyles[size],
    fullWidth && styles.fullWidth,
    variant === 'primary' && !gradientColors && { backgroundColor: color },
    variant === 'secondary' && { backgroundColor: colors.backgroundDark },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: color },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'primary' && shadows.sm,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    textSizeStyles[size],
    variant === 'primary' && { color: colors.white },
    variant === 'secondary' && { color: colors.text },
    variant === 'outline' && { color: color },
    variant === 'ghost' && { color: color },
    disabled && styles.disabledText,
    textStyle,
  ];

  const content = (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.white : color}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={textStyles}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );

  // Use gradient for primary buttons if gradientColors provided
  if (variant === 'primary' && gradientColors && !disabled) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[animatedStyle, fullWidth && styles.fullWidth]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyles[size], shadows.sm, style, styles.gradient]}
        >
          {content}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[buttonStyles, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {content}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    borderRadius: borderRadius.xl,
  },
  text: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textLight,
  },
});
