import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Pressable, View, Animated } from 'react-native';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;

  const boxSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: checked ? 1 : 0,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  }, [checked]);

  const handlePress = () => {
    // Bounce animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Haptic feedback
    if (!checked) {
      haptic.success();
    } else {
      haptic.selection();
    }

    onToggle();
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Animated.View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            backgroundColor: checked ? color : 'transparent',
            borderColor: checked ? color : colors.textMuted,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: checkAnim }],
            opacity: checkAnim,
          }}
        >
          <Ionicons name="checkmark" size={iconSize} color={colors.white} />
        </Animated.View>
      </Animated.View>
      {label && (
        <Text
          style={[
            styles.label,
            checked && strikethrough && styles.checkedLabel,
          ]}
        >
          {label}
        </Text>
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
    borderRadius: borderRadius.md, // More rounded
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
    color: colors.textMuted,
    opacity: 0.7,
  },
});
