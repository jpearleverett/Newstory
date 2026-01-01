import * as Haptics from 'expo-haptics';

// Haptic feedback utilities for a more tactile experience
export const haptic = {
  // Light tap - for selections and toggles
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),

  // Medium tap - for button presses
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),

  // Heavy tap - for important actions
  heavy: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy),

  // Success - for completed actions
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),

  // Warning - for warnings
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),

  // Error - for errors
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),

  // Selection - for picker/selection changes
  selection: () => Haptics.selectionAsync(),
};

export default haptic;
