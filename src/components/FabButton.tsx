import React, {useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import {IconPlus} from '@tabler/icons-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
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
  /** Gentle breathe loop — e.g. no habits yet */
  attention?: boolean;
};

export function FabButton({onPress, accessibilityLabel, attention}: Props) {
  const {colors} = useTheme();
  const reduceMotion = useReducedMotionPreference();
  const shift = useSharedValue(0);
  const breathe = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shift.value * 2}, {translateY: shift.value * 2}],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{scale: breathe.value}],
  }));

  useEffect(() => {
    if (reduceMotion || !attention) {
      breathe.value = withTiming(1, {duration: 180});
      return;
    }
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.03, {duration: 1200, easing: Motion.transitionEase}),
        withTiming(1, {duration: 1200, easing: Motion.transitionEase}),
      ),
      -1,
      false,
    );
  }, [attention, breathe, reduceMotion]);

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
          !reduceMotion ? pressStyle : null,
          !reduceMotion && attention ? pulseStyle : null,
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
