import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {IconPlus} from '@tabler/icons-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import {useReducedMotionPreference} from '../hooks/useReducedMotionPreference';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {fabShadow, rimThinWidth} from '../theme/shadows';

type Props = {
  onPress: () => void;
  accessibilityLabel: string;
};

export function FabButton({onPress, accessibilityLabel}: Props) {
  const {colors} = useTheme();
  const reduceMotion = useReducedMotionPreference();
  const shift = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shift.value * 2}, {translateY: shift.value * 2}],
  }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      onPress={onPress}
      onPressIn={() => {
        triggerHaptic('medium');
        if (!reduceMotion) {
          shift.value = withSpring(1, Motion.pressSpring);
        }
      }}
      onPressOut={() => {
        if (!reduceMotion) {
          shift.value = withSpring(0, Motion.pressSpring);
        }
      }}>
      <Animated.View
        style={[
          styles.fab,
          {
            backgroundColor: colors.inkViolet,
            borderColor: colors.border,
          },
          fabShadow(colors),
          !reduceMotion ? animStyle : null,
        ]}>
        <IconPlus color={colors.onPrimary} size={24} strokeWidth={2.25} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    borderWidth: rimThinWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
