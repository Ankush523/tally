import React from 'react';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {useReducedMotionPreference} from '../hooks/useReducedMotionPreference';
import {Motion} from '../theme/motion';

type Props = {
  children: React.ReactNode;
  /** Stagger offset in ms */
  delay?: number;
};

/** Section entrance — spring + fade; skipped when Reduce Motion is on */
export function FadeIn({children, delay = 0}: Props) {
  const reduceMotion = useReducedMotionPreference();
  if (reduceMotion) {
    return <>{children}</>;
  }
  return (
    <Animated.View
      entering={FadeInDown.springify()
        .damping(Motion.entranceSpring.damping)
        .stiffness(Motion.entranceSpring.stiffness)
        .mass(Motion.entranceSpring.mass)
        .delay(delay)}>
      {children}
    </Animated.View>
  );
}
