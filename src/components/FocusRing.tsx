import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useTheme} from '../hooks/useTheme';
import {Typography} from '../theme/typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  radius?: number;
  strokeWidth?: number;
  /** 0–1 progress remaining */
  progress: number;
  label: string;
};

export function FocusRing({
  radius = 100,
  strokeWidth = 10,
  progress,
  label,
}: Props) {
  const {colors} = useTheme();
  const p = useSharedValue(progress);
  const size = radius * 2 + strokeWidth * 2;

  useEffect(() => {
    p.value = withTiming(progress, {
      duration: 400,
      easing: Easing.linear,
    });
  }, [p, progress]);

  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const dash = circumference * p.value;
    return {
      strokeDashoffset: circumference - dash,
    };
  });

  return (
    <View style={[styles.wrap, {width: size, height: size}]}>
      <Animated.View
        style={[
          styles.ringRotate,
          {width: size, height: size, transform: [{rotate: '-90deg'}]},
        ]}>
        <Svg width={size} height={size}>
          <Circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={colors.gray100}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <AnimatedCircle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={colors.inkViolet}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}, ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={styles.center}>
          <Text style={[Typography.heroNumber, {color: colors.textPrimary}]}>
            {label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringRotate: {
    position: 'absolute',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
