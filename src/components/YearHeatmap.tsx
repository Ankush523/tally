import React, {useMemo} from 'react';
import {StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {Canvas, Rect} from '@shopify/react-native-skia';
import {useTheme} from '../hooks/useTheme';
import type {ThemeColors} from '../theme/colors';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {toDateKey} from '../utils/dateKey';

export type YearDay = {dateKey: string; score: number};

function bucket(score: number, colors: ThemeColors): string {
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

type Props = {
  year: number;
  days: YearDay[];
};

/** GitHub-style year heatmap — Section 3.4 / 8.5 (Skia Canvas) */
export function YearHeatmap({year, days}: Props) {
  const {colors} = useTheme();
  const {width} = useWindowDimensions();
  const gap = 2;
  const pad = Spacing.md;
  const gridW = width - pad * 2;

  const byDate = useMemo(() => new Map(days.map(d => [d.dateKey, d.score])), [days]);

  const {cells, cols} = useMemo(() => {
    const jan1 = new Date(year, 0, 1);
    let col = 0;
    let row = jan1.getDay();
    const list: {col: number; row: number; c: string}[] = [];
    let maxCol = 0;

    for (
      let d = new Date(year, 0, 1);
      d.getFullYear() === year;
      d.setDate(d.getDate() + 1)
    ) {
      const key = toDateKey(d);
      const score = byDate.get(key) ?? 0;
      list.push({col, row, c: bucket(score, colors)});
      maxCol = Math.max(maxCol, col);
      row += 1;
      if (row > 6) {
        row = 0;
        col += 1;
      }
    }

    return {cells: list, cols: maxCol + 1};
  }, [byDate, colors, year]);

  const cell = (gridW - gap * (cols - 1)) / cols;
  const canvasH = 7 * cell + 6 * gap;

  return (
    <View
      style={[
        styles.wrap,
        cardShadow(colors),
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[Typography.sectionHeader, {color: colors.textPrimary}]}>
        {year} · day scores
      </Text>
      <Canvas style={{width: gridW, height: canvasH, marginTop: Spacing.sm}}>
        {cells.map((cellItem, i) => (
          <Rect
            key={i}
            x={cellItem.col * (cell + gap)}
            y={cellItem.row * (cell + gap)}
            width={cell}
            height={cell}
            color={cellItem.c}
          />
        ))}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: brutalBorderWidth,
  },
});
