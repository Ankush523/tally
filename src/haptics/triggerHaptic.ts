import {
  HapticFeedbackTypes,
  trigger,
  type HapticOptions,
} from 'react-native-haptic-feedback';

const options: HapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

/** Semantic haptics — map UI intent → native feedback (iOS Core Haptics / Android vibrator). */
export type AppHaptic =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

const map: Record<AppHaptic, HapticFeedbackTypes> = {
  selection: HapticFeedbackTypes.selection,
  light: HapticFeedbackTypes.impactLight,
  medium: HapticFeedbackTypes.impactMedium,
  heavy: HapticFeedbackTypes.impactHeavy,
  success: HapticFeedbackTypes.notificationSuccess,
  warning: HapticFeedbackTypes.notificationWarning,
  error: HapticFeedbackTypes.notificationError,
};

export function triggerHaptic(type: AppHaptic = 'light'): void {
  try {
    trigger(map[type], options);
  } catch {
    /* Simulator / unsupported — ignore */
  }
}
