import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  color = colors.olive,
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}) => {
  const buttonStyles = [
    styles.base,
    styles[size],
    variant === 'primary' && { backgroundColor: color },
    variant === 'secondary' && { backgroundColor: colors.backgroundDark },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 2, borderColor: color },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${size}Text`],
    variant === 'primary' && { color: colors.white },
    variant === 'secondary' && { color: colors.text },
    variant === 'outline' && { color: color },
    variant === 'ghost' && { color: color },
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.white : color} />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
  smallText: {
    fontSize: fontSize.sm,
  },
  mediumText: {
    fontSize: fontSize.md,
  },
  largeText: {
    fontSize: fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.textLight,
  },
});
