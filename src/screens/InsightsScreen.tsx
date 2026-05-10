import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {HapticPressable} from '../components/HapticPressable';
import {InsightCard} from '../components/InsightCard';
import {YearHeatmap} from '../components/YearHeatmap';
import DayScore from '../db/models/DayScore';
import {useTheme} from '../hooks/useTheme';
import {
  computeCorrelationInsights,
  generateMonthlyNarrative,
} from '../services/insightEngine';
import {Radius} from '../theme/radius';
import {brutalBorderWidth} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {toDateKey} from '../utils/dateKey';
import {subDays} from 'date-fns';

type Range = 'weekly' | 'monthly' | 'yearly';

function pct01(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export function InsightsScreen() {
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  const [range, setRange] = useState<Range>('weekly');
  const [insights, setInsights] = useState<Awaited<
    ReturnType<typeof computeCorrelationInsights>
  > >([]);
  const [scores, setScores] = useState<DayScore[]>([]);

  useEffect(() => {
    void (async () => {
      const cards = await computeCorrelationInsights(db, 28);
      setInsights(cards);
    })();
  }, [db]);

  useEffect(() => {
    const keys: string[] = [];
    for (let i = 0; i < 370; i++) {
      keys.push(toDateKey(subDays(new Date(), i)));
    }
    const sub = db
      .get<DayScore>('day_scores')
      .query(Q.where('date', Q.oneOf(keys)))
      .observe()
      .subscribe(setScores);
    return () => sub.unsubscribe();
  }, [db]);

  const last7Keys = useMemo(
    () =>
      Array.from({length: 7}, (_, i) => toDateKey(subDays(new Date(), i))),
    [],
  );

  const last7Scores = useMemo(() => {
    const set = new Set(last7Keys);
    return scores.filter(s => set.has(s.date));
  }, [scores, last7Keys]);

  const metrics7d = useMemo(() => {
    const slice = last7Scores;
    const n = slice.length;
    if (n === 0) {
      return {
        avgScore: null as number | null,
        focusMin: 0,
        avgHabitSlice: null as number | null,
        avgTaskSlice: null as number | null,
      };
    }
    const avgScore = slice.reduce((a, s) => a + s.score, 0) / n;
    const focusMin = slice.reduce((a, s) => a + s.focusMin, 0);
    const avgHabitSlice = slice.reduce((a, s) => a + s.habitPct, 0) / n;
    const avgTaskSlice = slice.reduce((a, s) => a + s.taskPct, 0) / n;
    return {avgScore, focusMin, avgHabitSlice, avgTaskSlice};
  }, [last7Scores]);

  const yearDays = useMemo(
    () =>
      scores.map(s => ({
        dateKey: s.date,
        score: s.score,
      })),
    [scores],
  );

  const narrative = generateMonthlyNarrative({
    monthLabel: new Date().toLocaleString('default', {month: 'long'}),
    avgScore: metrics7d.avgScore ?? 10,
    prevAvg: (metrics7d.avgScore ?? 10) - 2,
    topHabitName: undefined,
  });

  const ranges = ['weekly', 'monthly', 'yearly'] as const;

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
      <View style={styles.headerBlock}>
        <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
          Insights
        </Text>
        <Text style={[Typography.metadata, {color: colors.textMuted}]}>
          Numbers refresh as you log habits, tasks, and focus.
        </Text>
      </View>

      <View
        style={[
          styles.segmentShell,
          {borderColor: colors.border, backgroundColor: colors.surfaceRaised},
        ]}>
        {ranges.map((r, i) => {
          const selected = range === r;
          return (
            <HapticPressable
              haptic="selection"
              key={r}
              accessibilityRole="button"
              accessibilityState={{selected}}
              accessibilityLabel={`${r} range`}
              onPress={() => setRange(r)}
              style={({pressed}) => [
                styles.segment,
                i < ranges.length - 1 ? styles.segmentDivider : null,
                {borderRightColor: colors.border},
                {
                  backgroundColor: selected ? colors.violet50 : 'transparent',
                  opacity: pressed ? 0.88 : 1,
                },
              ]}>
              <Text
                style={[
                  Typography.metadata,
                  styles.segmentLabel,
                  {
                    color: selected ? colors.textPrimary : colors.textSecondary,
                  },
                ]}>
                {r}
              </Text>
            </HapticPressable>
          );
        })}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}>
        {range === 'weekly' ? (
          <>
            <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
              LAST 7 DAYS
            </Text>
            <View style={styles.statGrid}>
              <StatTile
                label="Avg score"
                value={
                  metrics7d.avgScore != null
                    ? metrics7d.avgScore.toFixed(0)
                    : '—'
                }
              />
              <StatTile
                label="Focus minutes"
                value={
                  metrics7d.focusMin > 0
                    ? `${Math.round(metrics7d.focusMin)}m`
                    : '0m'
                }
              />
              <StatTile
                label="Habit slice"
                value={
                  metrics7d.avgHabitSlice != null
                    ? pct01(metrics7d.avgHabitSlice)
                    : '—'
                }
              />
              <StatTile
                label="Task slice"
                value={
                  metrics7d.avgTaskSlice != null
                    ? pct01(metrics7d.avgTaskSlice)
                    : '—'
                }
              />
            </View>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              Slice = share of that day’s score from habits or tasks (see Score breakdown).
            </Text>

            {insights.length > 0 ? (
              <Text
                style={[
                  Typography.labelCaps,
                  {color: colors.textMuted, marginTop: Spacing.lg},
                ]}>
                CORRELATIONS
              </Text>
            ) : null}
            {insights.map(c => (
              <InsightCard key={c.id} title={c.title} body={c.body} />
            ))}
          </>
        ) : null}

        {range === 'monthly' ? (
          <>
            <Text style={[Typography.body, {color: colors.textPrimary}]}>
              {narrative}
            </Text>
            <Text
              style={[
                Typography.sectionHeader,
                {color: colors.textSecondary, marginTop: Spacing.xl},
              ]}>
              Personal records
            </Text>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              Longest streaks and best scores roll up here as you keep logging.
            </Text>
          </>
        ) : null}

        {range === 'yearly' ? (
          <YearHeatmap year={new Date().getFullYear()} days={yearDays} />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

/** Dense metric cell — border only (no shadow stack) so the grid stays readable */
function StatTile({label, value}: {label: string; value: string}) {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.stat,
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceRaised,
        },
      ]}>
      <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>{label}</Text>
      <Text style={[Typography.monoNumbers, styles.statValue, {color: colors.textPrimary}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, paddingHorizontal: Spacing.lg},
  headerBlock: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  segmentShell: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    justifyContent: 'center',
    minHeight: 44,
  },
  segmentDivider: {
    borderRightWidth: brutalBorderWidth,
  },
  segmentLabel: {
    textAlign: 'center',
  },
  scroll: {
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stat: {
    flex: 1,
    minWidth: '46%',
    maxWidth: '50%',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    gap: Spacing.sm,
  },
  statValue: {
    fontSize: 22,
  },
});
