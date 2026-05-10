import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import {useTheme} from '../hooks/useTheme';
import type {RootStackParamList} from '../navigation/types';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {parseSchedule, slotLabel} from '../utils/habitSchedule';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

export function HabitDetailScreen({route}: Props) {
  const {habitId} = route.params;
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  const [habit, setHabit] = useState<Habit | null>(null);
  const [logs, setLogs] = useState<HabitLog[]>([]);

  useEffect(() => {
    void (async () => {
      try {
        const h = await db.get<Habit>('habits').find(habitId);
        setHabit(h);
      } catch {
        setHabit(null);
      }
    })();
  }, [db, habitId]);

  useEffect(() => {
    const sub = db
      .get<HabitLog>('habit_logs')
      .query(Q.where('habit_id', habitId), Q.sortBy('date', Q.desc))
      .observe()
      .subscribe(setLogs);
    return () => sub.unsubscribe();
  }, [db, habitId]);

  const rate30 = useMemo(() => {
    const recent = logs.slice(0, 30);
    if (recent.length === 0) {
      return 0;
    }
    const done = recent.filter(l => l.status === 'done').length;
    return Math.round((done / recent.length) * 100);
  }, [logs]);

  if (!habit) {
    return (
      <View style={[styles.center, {backgroundColor: canvas}]}>
        <Text style={[Typography.body, {color: colors.textMuted}]}>Habit not found.</Text>
      </View>
    );
  }

  const sch = parseSchedule(habit.scheduleJson);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: canvas}} edges={['bottom']}>
    <ScrollView style={[styles.wrap, {backgroundColor: canvas}]}>
      <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
        {habit.name}
      </Text>
      <Text style={[Typography.metadata, {color: colors.textMuted}]}>
        {habit.checkMode} · {slotLabel(sch.slot)} · grace tokens {habit.graceTokens}
      </Text>

      <View style={styles.statsRow}>
        <MiniStat label="30-day rate" value={`${rate30}%`} />
        <MiniStat label="Logs tracked" value={`${logs.length}`} />
        <MiniStat label="Mode" value={habit.checkMode} />
      </View>

      <Text
        style={[
          Typography.sectionHeader,
          {color: colors.textPrimary, marginTop: Spacing.lg},
        ]}>
        Recent logs
      </Text>
      {logs.slice(0, 14).map(l => (
        <Text key={l.id} style={[Typography.metadata, {color: colors.textSecondary}]}>
          {l.date} · {l.status}
        </Text>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({label, value}: {label: string; value: string}) {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.mini,
        cardShadow(colors),
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceRaised,
        },
      ]}>
      <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>{label}</Text>
      <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: Spacing.lg,
  },
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    flexWrap: 'wrap',
  },
  mini: {
    flexGrow: 1,
    minWidth: '30%',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    gap: Spacing.xs,
  },
});
