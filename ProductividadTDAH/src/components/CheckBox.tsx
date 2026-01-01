import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../styles/theme';

interface CheckBoxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
}

export const CheckBox: React.FC<CheckBoxProps> = ({
  checked,
  onToggle,
  label,
  color = colors.olive,
  size = 'medium',
}) => {
  const boxSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  const iconSize = size === 'small' ? 14 : size === 'large' ? 24 : 18;

  return (
    <TouchableOpacity style={styles.container} onPress={onToggle} activeOpacity={0.7}>
      <View
        style={[
          styles.box,
          {
            width: boxSize,
            height: boxSize,
            borderColor: checked ? color : colors.textLight,
            backgroundColor: checked ? color : 'transparent',
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={iconSize} color={colors.white} />}
      </View>
      {label && (
        <Text style={[styles.label, checked && styles.checkedLabel]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  box: {
    borderWidth: 2,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
    flex: 1,
  },
  checkedLabel: {
    textDecorationLine: 'line-through',
    color: colors.textLight,
  },
});
