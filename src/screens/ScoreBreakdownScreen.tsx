import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import DayScore from '../db/models/DayScore';
import {useTheme} from '../hooks/useTheme';
import type {RootStackParamList} from '../navigation/types';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBreakdown'>;

export function ScoreBreakdownScreen({route}: Props) {
  const {dateKey} = route.params;
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  const [row, setRow] = useState<DayScore | null>(null);

  useEffect(() => {
    const sub = db
      .get<DayScore>('day_scores')
      .query(Q.where('date', dateKey))
      .observe()
      .subscribe(rows => setRow(rows[0] ?? null));
    return () => sub.unsubscribe();
  }, [db, dateKey]);

  const pct = (n: number) => `${Math.round(n * 100)}%`;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.wrap, {backgroundColor: canvas}]}>
      <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
        {dateKey}
      </Text>
      {row ? (
        <View style={{gap: Spacing.sm, marginTop: Spacing.md}}>
          <BreakdownRow label="Score" value={String(row.score)} />
          <BreakdownRow label="Habits weight slice" value={pct(row.habitPct)} />
          <BreakdownRow label="Tasks weight slice" value={pct(row.taskPct)} />
          <BreakdownRow label="Focus minutes" value={`${row.focusMin}m`} />
          <BreakdownRow label="Mindless screen (logged)" value={`${row.mindlessMin}m`} />
          <BreakdownRow label="Screen delta vs baseline" value={`${row.screenDelta}m`} />
        </View>
      ) : (
        <Text style={[Typography.body, {color: colors.textMuted}]}>
          No score row yet — complete a habit or pull to refresh on Home.
        </Text>
      )}
      <Text style={[Typography.metadata, {color: colors.textMuted, marginTop: Spacing.lg}]}>
        Weights default to 40% habits · 35% tasks · 15% focus · 10% screen penalty (Section
        5.2).
      </Text>
    </ScrollView>
  );
}

function BreakdownRow({label, value}: {label: string; value: string}) {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.row,
        cardShadow(colors),
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceRaised,
        },
      ]}>
      <Text style={[Typography.body, {color: colors.textSecondary}]}>{label}</Text>
      <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    alignItems: 'center',
  },
});
