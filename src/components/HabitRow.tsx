import React, {useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  IconCircleCheckFilled,
  IconCircleMinus,
} from '@tabler/icons-react-native';
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

  /** Never read optional JS callbacks inside gesture worklets — Reanimated 4 can crash; always runOnJS stable fns. */
  const runSwipeComplete = useCallback(() => {
    onComplete();
    triggerHaptic('success');
  }, [onComplete]);

  const runSwipeSkip = useCallback(() => {
    onSkip();
    triggerHaptic('light');
  }, [onSkip]);

  const runLongPressAction = useCallback(() => {
    if (!onLongPress) {
      return;
    }
    triggerHaptic('medium');
    setTimeout(onLongPress, 0);
  }, [onLongPress]);

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        /** Let vertical ScrollView win unless movement is clearly horizontal (avoids native gesture fights). */
        .failOffsetY([-22, 22])
        .onUpdate(e => {
          tx.value = e.translationX;
        })
        .onEnd(e => {
          if (e.translationX > SWIPE) {
            runOnJS(runSwipeComplete)();
            tx.value = withSpring(320, Motion.habitSpring);
          } else if (e.translationX < -SWIPE) {
            runOnJS(runSwipeSkip)();
            tx.value = withSpring(-40, Motion.habitSpring);
          } else {
            tx.value = withSpring(0, Motion.habitSpring);
          }
        }),
    [runSwipeComplete, runSwipeSkip, tx],
  );

  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(380)
        .onStart(() => {
          runOnJS(runLongPressAction)();
        }),
    [runLongPressAction],
  );

  const composed = useMemo(
    () => Gesture.Exclusive(longPress, pan),
    [longPress, pan],
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tx.value}],
  }));

  const bg = (() => {
    switch (state) {
      case 'done':
        return colors.habitDoneSurface;
      case 'skipped':
      case 'grace_used':
        return colors.habitSkippedSurface;
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

  const statusGlyph = (() => {
    const sz = 22;
    if (state === 'done') {
      return (
        <IconCircleCheckFilled color={colors.groveGreen} size={sz} />
      );
    }
    if (state === 'skipped' || state === 'grace_used') {
      return (
        <IconCircleMinus color={colors.heat3} size={sz} strokeWidth={2} />
      );
    }
    return <View style={[styles.glyphPlaceholder, {borderColor: colors.border}]} />;
  })();

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
        <View style={styles.glyphCol}>{statusGlyph}</View>
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
          {state === 'pending' ? (
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              Swipe → done · ← skip · hold to edit
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const ACCENT_RAIL_W = 4;

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
  glyphCol: {
    width: 34,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    paddingLeft: Spacing.xs,
  },
  glyphPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
  },
  inner: {
    flex: 1,
    paddingVertical: Spacing.md,
    paddingRight: Spacing.md,
    paddingLeft: Spacing.sm,
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
