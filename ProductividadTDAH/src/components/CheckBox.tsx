import React, { useEffect } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, animation } from '../styles/theme';
import haptic from '../utils/haptics';

interface CheckBoxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  strikethrough?: boolean;
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  onToggle,
  label,
  color = colors.primary,
  size = 'medium',
  strikethrough = true,
}) => {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(checked ? 1 : 0);
  const backgroundProgress = useSharedValue(checked ? 1 : 0);

  const boxSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;

  useEffect(() => {
    checkScale.value = withSpring(checked ? 1 : 0, animation.springBouncy);
    backgroundProgress.value = withTiming(checked ? 1 : 0, { duration: animation.normal });
  }, [checked]);

  const handlePress = () => {
    // Bounce animation
    scale.value = withSequence(
      withSpring(0.85, { damping: 10, stiffness: 400 }),
      withSpring(1, animation.springBouncy)
    );

    // Haptic feedback
    if (!checked) {
      haptic.success();
    } else {
      haptic.light();
    }

    onToggle();
  };

  const boxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      backgroundProgress.value,
      [0, 1],
      ['transparent', color]
    ),
    borderColor: interpolateColor(
      backgroundProgress.value,
      [0, 1],
      [colors.textLight, color]
    ),
  }));

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(checked ? 0.6 : 1, { duration: animation.normal }),
  }));

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Animated.View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
          },
          boxAnimatedStyle,
        ]}
      >
        <Animated.View style={checkAnimatedStyle}>
          <Ionicons name="checkmark" size={iconSize} color={colors.white} />
        </Animated.View>
      </Animated.View>
      {label && (
        <Animated.Text
          style={[
            styles.label,
            checked && strikethrough && styles.checkedLabel,
            labelAnimatedStyle,
          ]}
        >
          {label}
        </Animated.Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  box: {
    borderWidth: 2,
    borderRadius: borderRadius.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
    lineHeight: fontSize.md * 1.4,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
});
