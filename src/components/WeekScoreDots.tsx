import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {Radius} from '../theme/radius';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Day = {key: string; score: number};

type Props = {
  days: Day[];
};

function bucket(score: number): 'empty' | 'low' | 'mid' | 'high' {
  if (score < 0 || score === 0) {
    return 'empty';
  }
  if (score < 45) {
    return 'low';
  }
  if (score < 75) {
    return 'mid';
  }
  return 'high';
}

/** Seven-day sparkline — padded when history &lt; 7; not color-only (labels + borders). */
export function WeekScoreDots({days}: Props) {
  const {colors} = useTheme();

  const row = useMemo(() => {
    const last = days.slice(-7);
    const pad = Math.max(0, 7 - last.length);
    const placeholders: Day[] = Array.from({length: pad}, (_, i) => ({
      key: `__pad_${i}`,
      score: -1,
    }));
    return [...placeholders, ...last];
  }, [days]);

  const palette = {
    empty: colors.heat0,
    low: colors.heat1,
    mid: colors.heat2,
    high: colors.heat3,
  };

  const summary = useMemo(() => {
    const vals = row.map(d => (d.score < 0 ? 'no data' : `${d.score}`));
    return `Last seven days scores: ${vals.join(', ')}`;
  }, [row]);

  return (
    <View
      style={styles.row}
      accessibilityLabel="Last seven days"
      accessibilityHint={summary}>
      <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>LAST 7</Text>
      <View style={styles.dots}>
        {row.map(d => {
          const b = bucket(d.score);
          return (
            <View
              key={d.key}
              style={[
                styles.dot,
                {
                  backgroundColor: palette[b],
                  borderColor: colors.border,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingTop: Spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: Radius.xs,
    borderWidth: 1,
  },
});
