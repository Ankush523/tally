import {BottomTabBarButtonProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {GestureResponderEvent, Pressable, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useReducedMotionPreference} from '../hooks/useReducedMotionPreference';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {Motion} from '../theme/motion';

/** Tab target — brutal “seat” press: slides toward shadow */
export function AnimatedTabBarButton({
  children,
  onPress,
  onPressIn,
  onPressOut,
  style,
  ref: _ref,
  ...rest
}: BottomTabBarButtonProps) {
  const insets = useSafeAreaInsets();
  /** Balance bottom safe inset so icon+label stay vertically centered in the bar (bottom-only padding reads top-heavy). */
  const padBottom = insets.bottom;
  const padTop = padBottom > 0 ? Math.round(padBottom * 0.5) : 0;
  const reduceMotion = useReducedMotionPreference();
  const shift = useSharedValue(0);
  const anim = useAnimatedStyle(() => ({
    transform: [{translateX: shift.value * 2}, {translateY: shift.value * 2}],
  }));

  const handlePress = (e: GestureResponderEvent) => {
    triggerHaptic('selection');
    onPress?.(e);
  };

  const handleIn = (e: GestureResponderEvent) => {
    if (!reduceMotion) {
      shift.value = withSpring(1, Motion.tabSpring);
    }
    onPressIn?.(e);
  };

  const handleOut = (e: GestureResponderEvent) => {
    if (!reduceMotion) {
      shift.value = withSpring(0, Motion.tabSpring);
    }
    onPressOut?.(e);
  };

  return (
    <Pressable
      {...rest}
      style={[style, styles.pressableFill]}
      onPress={handlePress}
      onPressIn={handleIn}
      onPressOut={handleOut}>
      <Animated.View
        style={[
          styles.inner,
          {paddingTop: padTop, paddingBottom: padBottom},
          !reduceMotion ? anim : null,
        ]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /** Active gray is on Pressable — fill full column (RN puts tabBarItemStyle padding OUTSIDE this). */
  pressableFill: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
