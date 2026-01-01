import React, { useRef } from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator, Pressable, Animated, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows, animation } from '../styles/theme';
import haptic from '../utils/haptics';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: animation.fast,
        useNativeDriver: true,
      }),
    ]).start();
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
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={fullWidth ? styles.fullWidth : undefined}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.base, sizeStyles[size], shadows.sm, style, styles.gradient]}
          >
            {content}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          buttonStyles,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {content}
      </Animated.View>
    </Pressable>
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
