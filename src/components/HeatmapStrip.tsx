import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HapticPressable} from './HapticPressable';
import {useTheme} from '../hooks/useTheme';
import type {ThemeColors} from '../theme/colors';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Typography} from '../theme/typography';
import {Spacing} from '../theme/spacing';

type Cell = {score: number; key: string};

type Props = {
  days: Cell[];
  columns?: number;
  onOpenInsights?: () => void;
};

function scoreToColor(score: number, colors: ThemeColors) {
  if (score <= 0) {
    return colors.heat0;
  }
  if (score <= 25) {
    return colors.heat1;
  }
  if (score <= 60) {
    return colors.heat2;
  }
  if (score <= 85) {
    return colors.heat3;
  }
  return colors.heat4;
}

/** Last N days — brutal grid cells */
export function HeatmapStrip({days, columns = 7, onOpenInsights}: Props) {
  const {colors} = useTheme();
  const rows = Math.ceil(days.length / columns);

  return (
    <HapticPressable
      haptic="light"
      onPress={onOpenInsights}
      accessibilityRole="button"
      accessibilityLabel={`Last ${days.length} days heatmap, open insights`}
      android_ripple={{color: colors.primaryMuted}}
      style={({pressed}) => (pressed ? {opacity: 0.96} : null)}>
      <View
        style={[
          styles.panel,
          cardShadow(colors),
          {
            backgroundColor: colors.surfaceRaised,
            borderColor: colors.border,
          },
        ]}>
        <View style={styles.headerRow}>
          <Text style={[Typography.labelCaps, {color: colors.textSecondary}]}>
            LAST {days.length} DAYS
          </Text>
        </View>
        <View style={styles.grid}>
          {Array.from({length: rows}).map((_, r) => (
            <View key={r} style={styles.row}>
              {Array.from({length: columns}).map((__, c) => {
                const idx = r * columns + c;
                const d = days[idx];
                if (!d) {
                  return <View key={c} style={[styles.cell, {opacity: 0}]} />;
                }
                return (
                  <View
                    key={d.key}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: scoreToColor(d.score, colors),
                        borderColor: colors.border,
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </HapticPressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: brutalBorderWidth,
    gap: Spacing.sm,
  },
  headerRow: {
    marginBottom: Spacing.xs,
  },
  grid: {
    gap: 3,
  },
  row: {
    flexDirection: 'row',
    gap: 3,
  },
  cell: {
    width: 14,
    height: 14,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
});
