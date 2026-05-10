import React, {useCallback} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Habit from '../db/models/Habit';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {HapticPressable} from './HapticPressable';

export type RowVisualState =
  | 'pending'
  | 'done'
  | 'skipped'
  | 'grace_used'
  | 'missed';

type Props = {
  habit: Habit;
  state: RowVisualState;
  slotLabel: string;
  missedYesterday?: boolean;
  graceTokensLeft: number;
  onComplete: () => void;
  onSkip: () => void;
  onLongPress?: () => void;
  onUseGrace?: () => void;
  onForfeitGrace?: () => void;
};

const SWIPE = 80;

export function HabitRow({
  habit,
  state,
  slotLabel,
  missedYesterday,
  graceTokensLeft,
  onComplete,
  onSkip,
  onLongPress,
  onUseGrace,
  onForfeitGrace,
}: Props) {
  const {colors} = useTheme();
  const tx = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate(e => {
      tx.value = e.translationX;
    })
    .onEnd(e => {
      if (e.translationX > SWIPE) {
        runOnJS(onComplete)();
        runOnJS(() => triggerHaptic('success'))();
        tx.value = withSpring(320, Motion.habitSpring);
      } else if (e.translationX < -SWIPE) {
        runOnJS(onSkip)();
        runOnJS(() => triggerHaptic('light'))();
        tx.value = withSpring(-40, Motion.habitSpring);
      } else {
        tx.value = withSpring(0, Motion.habitSpring);
      }
    });

  const longPress = Gesture.LongPress()
    .minDuration(380)
    .onStart(() => {
      runOnJS(() => triggerHaptic('medium'))();
      if (onLongPress) {
        runOnJS(onLongPress)();
      }
    });

  const composed = Gesture.Exclusive(longPress, pan);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tx.value}],
  }));

  const bg = (() => {
    switch (state) {
      case 'done':
        return colors.green50;
      case 'skipped':
      case 'grace_used':
        return colors.amber50;
      case 'missed':
        return colors.missedTint;
      default:
        return colors.sheetSurface;
    }
  })();

  const resetAnim = useCallback(() => {
    tx.value = withSpring(0, Motion.habitSpring);
  }, [tx]);

  React.useEffect(() => {
    resetAnim();
  }, [state, resetAnim]);

  /** Inset rail avoids multi-color border miters (green vs black corners). */
  const accentRailColor = (() => {
    switch (state) {
      case 'pending':
        return colors.gray100;
      case 'done':
        return colors.groveGreen;
      case 'skipped':
      case 'grace_used':
        return colors.heat3;
      case 'missed':
        return colors.ember;
      default:
        return colors.gray100;
    }
  })();

  const elevated = state === 'pending';

  return (
    <GestureDetector gesture={composed}>
      <Animated.View
        style={[
          styles.rowShell,
          animStyle,
          elevated ? cardShadow(colors) : null,
          {backgroundColor: bg},
        ]}
        accessibilityLabel={`Habit ${habit.name}`}>
        <View style={[styles.accentRail, {backgroundColor: accentRailColor}]} />
        <View style={styles.inner}>
          <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
            {slotLabel}
          </Text>
          <Text
            style={[
              Typography.body,
              {
                color: colors.textPrimary,
                textDecorationLine:
                  state === 'done' ? 'line-through' : 'none',
              },
            ]}>
            {habit.name}
          </Text>
          {missedYesterday && onUseGrace && onForfeitGrace ? (
            <View style={styles.graceRow}>
              <Text style={[Typography.metadata, {color: colors.ember}]}>
                Missed yesterday. {graceTokensLeft} grace tokens left — use one?
              </Text>
              <View style={styles.graceActions}>
                <HapticPressable
                  haptic="medium"
                  onPress={onUseGrace}
                  style={styles.graceBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Use grace token">
                  <Text style={[Typography.metadata, {color: colors.inkViolet}]}>
                    Use token
                  </Text>
                </HapticPressable>
                <HapticPressable
                  haptic="light"
                  onPress={onForfeitGrace}
                  accessibilityRole="button"
                  accessibilityLabel="Decline grace token"
                  style={styles.graceBtnSecondary}>
                  <Text style={[Typography.metadata, {color: colors.textMuted}]}>
                    No thanks
                  </Text>
                </HapticPressable>
              </View>
            </View>
          ) : null}
          <Text style={[Typography.metadata, {color: colors.textMuted}]}>
            Swipe right · done · left · skip
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const ACCENT_RAIL_W = 8;

const styles = StyleSheet.create({
  rowShell: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  accentRail: {
    width: ACCENT_RAIL_W,
    alignSelf: 'stretch',
  },
  inner: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm + 2,
    gap: Spacing.xs,
  },
  graceRow: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
  },
  graceActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  graceBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  graceBtnSecondary: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
  },
});
