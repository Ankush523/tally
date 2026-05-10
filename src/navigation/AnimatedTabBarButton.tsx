import {BottomTabBarButtonProps} from '@react-navigation/bottom-tabs';
import React from 'react';
import {GestureResponderEvent, Pressable, StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle, useSharedValue, withSpring} from 'react-native-reanimated';
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
      style={style}
      onPress={handlePress}
      onPressIn={handleIn}
      onPressOut={handleOut}>
      <Animated.View style={[styles.inner, !reduceMotion ? anim : null]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
