import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {HapticPressable} from './HapticPressable';
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
  const animated = useSharedValue(score);
  const [display, setDisplay] = React.useState(String(score));
  const barWidth = useSharedValue(score / 100);

  useEffect(() => {
    animated.value = withTiming(score, {
      duration: Motion.scoreTickMs,
      easing: Motion.scoreEaseOut,
    });
    barWidth.value = withTiming(score / 100, {
      duration: Motion.scoreTickMs,
      easing: Motion.scoreEaseOut,
    });
  }, [animated, barWidth, score]);

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

  const deltaLabel =
    deltaVsYesterday === 0
      ? 'same as yesterday'
      : deltaVsYesterday > 0
        ? `↑${deltaVsYesterday} from yesterday`
        : `↓${Math.abs(deltaVsYesterday)} from yesterday`;

  return (
    <HapticPressable
      haptic="medium"
      onPress={onPressBreakdown}
      accessibilityRole="button"
      accessibilityLabel="Day score, tap for breakdown"
      android_ripple={{color: colors.primaryMuted}}
      style={({pressed}) => (pressed ? {opacity: 0.96} : null)}>
      <View
        style={[
          styles.card,
          cardShadow(colors),
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.rowTop}>
          <Text style={[Typography.labelCaps, {color: colors.inkViolet}]}>
            TODAY
          </Text>
          <Text style={[Typography.metadata, {color: colors.textMuted}]}>
            {tag}
          </Text>
        </View>
        <Animated.Text
          style={[
            Typography.heroNumber,
            styles.hero,
            {color: colors.textPrimary},
          ]}>
          {display}
        </Animated.Text>
        <View style={[styles.track, {backgroundColor: colors.gray100, borderColor: colors.border}]}>
          <Animated.View
            style={[
              styles.bar,
              {backgroundColor: colors.inkViolet},
              barStyle,
            ]}
          />
        </View>
        <Text style={[Typography.metadata, {color: colors.textSecondary}]}>
          {deltaLabel} · on track
        </Text>
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: brutalBorderWidth,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: {
    marginVertical: Spacing.xs,
  },
  track: {
    height: 10,
    borderRadius: Radius.xs,
    overflow: 'hidden',
    borderWidth: 2,
  },
  bar: {
    height: '100%',
    borderRadius: Radius.xs,
  },
});
