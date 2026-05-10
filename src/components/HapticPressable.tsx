import React from 'react';
import {Pressable, type PressableProps} from 'react-native';
import {triggerHaptic, type AppHaptic} from '../haptics/triggerHaptic';

export type HapticPressableProps = PressableProps & {
  /** Default `light`. Set `false` to skip (e.g. nested handlers). */
  haptic?: AppHaptic | false;
};

/**
 * Pressable that fires haptic on press-in before your handlers.
 * Keeps feedback aligned with visual press state across the app.
 */
export const HapticPressable = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  HapticPressableProps
>(function HapticPressable(
  {haptic = 'light', onPressIn, ...rest},
  ref,
) {
  return (
    <Pressable
      ref={ref}
      {...rest}
      onPressIn={e => {
        if (haptic !== false) {
          triggerHaptic(haptic);
        }
        onPressIn?.(e);
      }}
    />
  );
});
