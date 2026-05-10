import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
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

  const style = useAnimatedStyle(() => ({
    transform: [{translateX: tx.value}],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.card,
          cardShadow(colors),
          style,
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
          },
        ]}>
        <HapticPressable
          haptic="light"
          onPress={onOpen}
          style={({pressed}) => [styles.inner, pressed ? {opacity: 0.92} : null]}
          accessibilityRole="button"
          accessibilityLabel={`Task ${task.title}`}>
          <View style={styles.top}>
            <Text style={[Typography.body, {color: colors.textPrimary, flex: 1}]}>
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
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  inner: {
    padding: Spacing.md,
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
