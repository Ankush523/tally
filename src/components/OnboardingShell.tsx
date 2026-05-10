import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useTheme} from '../hooks/useTheme';
import {Radius} from '../theme/radius';
import {brutalBorderWidth} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = {
  step: number;
  stepCount?: number;
  children: React.ReactNode;
};

export function OnboardingShell({step, stepCount = 4, children}: Props) {
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  return (
    <SafeAreaView
      style={[styles.safe, {backgroundColor: canvas}]}
      edges={['top', 'bottom']}>
      <View style={styles.progressTrack}>
        {Array.from({length: stepCount}).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                width: i === step ? 42 : 24,
                backgroundColor:
                  i <= step ? colors.inkViolet : colors.sheetSurface,
                borderColor: colors.border,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.inner}>{children}</View>
    </SafeAreaView>
  );
}

export function OnboardingKicker({text}: {text: string}) {
  const {colors} = useTheme();
  return (
    <Text style={[Typography.labelCaps, {color: colors.inkViolet, marginBottom: Spacing.sm}]}>
      {text}
    </Text>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  progressTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  segment: {
    height: 10,
    borderRadius: Radius.xs,
    borderWidth: brutalBorderWidth,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
});
