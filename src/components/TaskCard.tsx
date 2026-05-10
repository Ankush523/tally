import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {IconCheck} from '@tabler/icons-react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Task from '../db/models/Task';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {HapticPressable} from './HapticPressable';

type Props = {
  task: Task;
  onComplete: () => void;
  onDefer: () => void;
  onOpen?: () => void;
};

const SWIPE = 72;

function energyColor(
  tag: string,
  colors: ReturnType<typeof useTheme>['colors'],
): string {
  if (tag === 'deep') {
    return colors.energyDeep;
  }
  if (tag === 'quick') {
    return colors.energyQuick;
  }
  return colors.energyLow;
}

function energyLabelColor(
  tag: string,
  colors: ReturnType<typeof useTheme>['colors'],
  isDark: boolean,
): string {
  if (tag === 'deep') {
    return isDark ? colors.graphite : colors.onPrimary;
  }
  if (tag === 'low') {
    return colors.textPrimary;
  }
  return colors.onPrimary;
}

export function TaskCard({task, onComplete, onDefer, onOpen}: Props) {
  const {colors, isDark} = useTheme();
  const tx = useSharedValue(0);
  const checkScale = useSharedValue(1);

  const pan = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .onUpdate(e => {
      tx.value = e.translationX;
    })
    .onEnd(e => {
      if (e.translationX > SWIPE) {
        runOnJS(onComplete)();
        runOnJS(() => triggerHaptic('success'))();
        tx.value = withSpring(280, Motion.habitSpring);
      } else if (e.translationX < -SWIPE) {
        runOnJS(onDefer)();
        runOnJS(() => triggerHaptic('light'))();
        tx.value = withSpring(-60, Motion.habitSpring);
      } else {
        tx.value = withSpring(0, Motion.habitSpring);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{translateX: tx.value}],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{scale: checkScale.value}],
  }));

  const fireComplete = () => {
    triggerHaptic('success');
    checkScale.value = withSequence(
      withSpring(0.12, Motion.pressSpring),
      withSpring(1, Motion.milestoneSpring),
    );
    setTimeout(() => onComplete(), 280);
  };

  return (
    <View
      style={[
        styles.card,
        cardShadow(colors),
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.border,
        },
      ]}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.row, rowStyle]}>
          <HapticPressable
            haptic="medium"
            onPress={fireComplete}
            accessibilityRole="button"
            accessibilityLabel={`Mark complete: ${task.title}`}
            hitSlop={{top: 8, bottom: 8, left: 10, right: 6}}
            style={styles.checkHit}>
            <Animated.View
              style={[
                styles.checkRing,
                {borderColor: colors.border, backgroundColor: colors.sheetSurface},
                checkStyle,
              ]}>
              <IconCheck color={colors.groveGreen} size={16} strokeWidth={2.5} />
            </Animated.View>
          </HapticPressable>
          <HapticPressable
            haptic="light"
            onPress={onOpen}
            style={({pressed}) => [
              styles.inner,
              pressed ? {opacity: 0.92} : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Task ${task.title}`}>
            <View style={styles.top}>
              <Text style={[Typography.taskTitle, styles.titleFlex, {color: colors.textPrimary}]}>
                {task.title}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: energyColor(task.energyTag, colors),
                    borderColor: colors.border,
                  },
                ]}>
                <Text
                  style={[
                    Typography.labelCaps,
                    {
                      color: energyLabelColor(task.energyTag, colors, isDark),
                      fontSize: 9,
                    },
                  ]}>
                  {task.energyTag}
                </Text>
              </View>
            </View>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              est. {task.estimatedMin} min · {task.slot}
            </Text>
          </HapticPressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  checkHit: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
    paddingLeft: Spacing.sm,
    paddingRight: Spacing.xs,
  },
  titleFlex: {
    flex: 1,
    minWidth: 0,
  },
  checkRing: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    flex: 1,
    padding: Spacing.md,
    paddingLeft: Spacing.sm,
    gap: Spacing.xs,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.xs,
    borderWidth: 2,
  },
});
