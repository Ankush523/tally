import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {HapticPressable} from './HapticPressable';
import {useReducedMotionPreference} from '../hooks/useReducedMotionPreference';
import {useTheme} from '../hooks/useTheme';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = {
  score: number;
  deltaVsYesterday: number;
  tag: 'on track' | 'good day' | 'personal best' | 'slow start';
  onPressBreakdown?: () => void;
};

export function DayScoreCard({
  score,
  deltaVsYesterday,
  tag,
  onPressBreakdown,
}: Props) {
  const {colors} = useTheme();
  const reduceMotion = useReducedMotionPreference();
  const animated = useSharedValue(score);
  const [display, setDisplay] = React.useState(String(score));
  const barWidth = useSharedValue(score / 100);
  const borderPulse = useSharedValue(0);

  const borderLo = colors.border;
  const borderHi = colors.inkViolet;

  useEffect(() => {
    animated.value = withTiming(score, {
      duration: Motion.scoreTickMs,
      easing: Motion.scoreEaseOut,
    });
    barWidth.value = withTiming(score / 100, {
      duration: Motion.scoreTickMs,
      easing: Motion.scoreEaseOut,
    });
    borderPulse.value = 0;
    if (!reduceMotion) {
      borderPulse.value = withSequence(
        withTiming(1, {duration: Motion.scorePulseInMs}),
        withTiming(0, {duration: Motion.scorePulseOutMs}),
      );
    }
  }, [
    animated,
    barWidth,
    borderPulse,
    score,
    reduceMotion,
  ]);

  useAnimatedReaction(
    () => Math.round(animated.value),
    v => {
      runOnJS(setDisplay)(String(v));
    },
    [animated],
  );

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%`,
  }));

  const cardPulseStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(borderPulse.value, [0, 1], [borderLo, borderHi]),
  }));

  const deltaLabel =
    deltaVsYesterday === 0
      ? 'same as yesterday'
      : deltaVsYesterday > 0
        ? `↑${deltaVsYesterday} from yesterday`
        : `↓${Math.abs(deltaVsYesterday)} from yesterday`;

  const a11yLabel = `Today score ${display} out of 100. ${deltaLabel}. ${tag}. Opens breakdown.`;

  return (
    <HapticPressable
      haptic="medium"
      onPress={onPressBreakdown}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      android_ripple={{color: colors.primaryMuted}}
      style={({pressed}) => (pressed ? {opacity: 0.96} : null)}>
      <Animated.View
        style={[
          styles.card,
          cardShadow(colors),
          cardPulseStyle,
          {
            backgroundColor: colors.scoreCardTint,
            borderWidth: brutalBorderWidth,
          },
        ]}>
        <View style={styles.rowTop}>
          <Text style={[Typography.labelCaps, {color: colors.inkViolet}]}>
            TODAY
          </Text>
        </View>
        <Animated.Text
          style={[
            Typography.heroNumber,
            styles.heroSize,
            {color: colors.textPrimary},
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no">
          {display}
        </Animated.Text>
        <View
          style={[styles.track, {backgroundColor: colors.gray100, borderColor: colors.border}]}
          importantForAccessibility="no">
          <Animated.View
            style={[styles.bar, {backgroundColor: colors.inkViolet}, barStyle]}
          />
        </View>
        <Text style={[Typography.metadata, {color: colors.textSecondary}]}>
          {deltaLabel} · {tag}
        </Text>
      </Animated.View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroSize: {
    fontSize: 60,
    lineHeight: 66,
    marginVertical: Spacing.xs,
  },
  track: {
    height: 6,
    borderRadius: Radius.xs,
    overflow: 'hidden',
    borderWidth: 1,
  },
  bar: {
    height: '100%',
    borderRadius: Radius.xs,
  },
});
