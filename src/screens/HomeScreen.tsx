import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import type {BottomTabNavigationProp} from '@react-navigation/bottom-tabs';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {DayScoreCard} from '../components/DayScoreCard';
import {HapticPressable} from '../components/HapticPressable';
import {FadeIn} from '../components/FadeIn';
import {HeatmapStrip} from '../components/HeatmapStrip';
import {HabitRow, RowVisualState} from '../components/HabitRow';
import {TaskCard} from '../components/TaskCard';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import Task from '../db/models/Task';
import DayScore from '../db/models/DayScore';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import type {MainTabParamList, RootStackParamList} from '../navigation/types';
import {
  completeHabitForDay,
  forfeitStreakForMissedDay,
  skipHabitForDay,
  spendGraceTokenForHabit,
  yesterdayKey,
} from '../services/habitActions';
import {computeDayScore, getOrComputeTodayScore} from '../services/scoreEngine';
import {completeTask, deferTaskToLater} from '../services/taskActions';
import {useAuthStore} from '../stores/authStore';
import {readDisplayName} from '../stores/settingsStore';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {brutalBorderWidth, cardShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {parseSchedule, slotLabel} from '../utils/habitSchedule';
import {toDateKey} from '../utils/dateKey';
import {subDays} from 'date-fns';

function deriveState(
  logToday: HabitLog | undefined,
  logYesterday: HabitLog | undefined,
): {state: RowVisualState; missedYesterday: boolean} {
  const missedYesterday =
    !logYesterday ||
    !['done', 'skipped', 'grace_used'].includes(logYesterday.status);

  if (logToday?.status === 'done') {
    return {state: 'done', missedYesterday};
  }
  if (logToday?.status === 'skipped') {
    return {state: 'skipped', missedYesterday};
  }
  if (logToday?.status === 'grace_used') {
    return {state: 'grace_used', missedYesterday};
  }
  if (logToday?.status === 'missed') {
    return {state: 'missed', missedYesterday};
  }
  return {state: 'pending', missedYesterday};
}

export function HomeScreen() {
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const rootNavigation =
    tabNavigation.getParent() as NativeStackNavigationProp<RootStackParamList>;
  const authLoggedIn = useAuthStore(s => s.isLoggedIn);
  const authEmail = useAuthStore(s => s.sampleEmail);
  const todayKey = toDateKey(new Date());
  const yKey = yesterdayKey();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [logsToday, setLogsToday] = useState<HabitLog[]>([]);
  const [logsYesterday, setLogsYesterday] = useState<HabitLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayScore, setTodayScore] = useState<DayScore | null>(null);
  const [yesterdayScoreVal, setYesterdayScoreVal] = useState(10);
  const [heatmapDays, setHeatmapDays] = useState<{score: number; key: string}[]>(
    [],
  );
  const [refreshing, setRefreshing] = useState(false);

  const loadHeatmap = useCallback(async () => {
    const keys: string[] = [];
    for (let i = 27; i >= 0; i--) {
      keys.push(toDateKey(subDays(new Date(), i)));
    }
    const rows = await db
      .get<DayScore>('day_scores')
      .query(Q.where('date', Q.oneOf(keys)))
      .fetch();
    const map = new Map(rows.map(r => [r.date, r.score]));
    setHeatmapDays(keys.map(k => ({key: k, score: map.get(k) ?? 0})));
  }, [db]);

  useEffect(() => {
    const subH = db.get<Habit>('habits').query().observe().subscribe(setHabits);
    const subLt = db
      .get<HabitLog>('habit_logs')
      .query(Q.where('date', todayKey))
      .observe()
      .subscribe(setLogsToday);
    const subLy = db
      .get<HabitLog>('habit_logs')
      .query(Q.where('date', yKey))
      .observe()
      .subscribe(setLogsYesterday);
    const subT = db.get<Task>('tasks').query().observe().subscribe(setTasks);
    const subSc = db
      .get<DayScore>('day_scores')
      .query(Q.where('date', todayKey))
      .observe()
      .subscribe(rows => setTodayScore(rows[0] ?? null));

    void loadHeatmap();

    return () => {
      subH.unsubscribe();
      subLt.unsubscribe();
      subLy.unsubscribe();
      subT.unsubscribe();
      subSc.unsubscribe();
    };
  }, [db, loadHeatmap, todayKey, yKey]);

  const logTodayByHabit = useMemo(() => {
    const m = new Map<string, HabitLog>();
    logsToday.forEach(l => m.set(l.habitId, l));
    return m;
  }, [logsToday]);

  const logYesterdayByHabit = useMemo(() => {
    const m = new Map<string, HabitLog>();
    logsYesterday.forEach(l => m.set(l.habitId, l));
    return m;
  }, [logsYesterday]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await computeDayScore(db, todayKey);
    await loadHeatmap();
    const yestRow = await db
      .get<DayScore>('day_scores')
      .query(Q.where('date', yKey))
      .fetch();
    setYesterdayScoreVal(yestRow[0]?.score ?? 10);
    setRefreshing(false);
    triggerHaptic('light');
  }, [db, loadHeatmap, todayKey, yKey]);

  useEffect(() => {
    void (async () => {
      await getOrComputeTodayScore(db);
      const yRow = await db
        .get<DayScore>('day_scores')
        .query(Q.where('date', yKey))
        .fetch();
      setYesterdayScoreVal(yRow[0]?.score ?? 10);
    })();
  }, [db, habits.length, logsToday.length, tasks.length, todayKey, yKey]);

  const scoreVal = todayScore?.score ?? 10;
  const delta = scoreVal - yesterdayScoreVal;
  const tag: 'on track' | 'good day' | 'personal best' | 'slow start' =
    scoreVal >= 85 ? 'personal best' : scoreVal >= 65 ? 'good day' : scoreVal >= 40 ? 'on track' : 'slow start';

  const doneCount = habits.filter(h => logTodayByHabit.get(h.id)?.status === 'done').length;

  const openTasks = tasks.filter(t => !t.completedAt).slice(0, 3);

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 17
        ? 'Good afternoon'
        : 'Good evening';

  const displayFirstName =
    authLoggedIn && authEmail
      ? authEmail.split('@')[0]?.replace(/[._-]/g, ' ') ?? readDisplayName()
      : readDisplayName();

  const initials = (() => {
    if (authLoggedIn && authEmail) {
      const local = authEmail.split('@')[0] ?? '';
      const letters = local.replace(/[^a-zA-Z]/g, '');
      if (letters.length >= 2) {
        return letters.slice(0, 2).toUpperCase();
      }
      if (letters.length === 1) {
        return letters.toUpperCase();
      }
      return local.slice(0, 2).toUpperCase() || 'TY';
    }
    return (
      readDisplayName()
        .split(/\s+/)
        .map(w => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'TY'
    );
  })();

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.inkViolet}
            colors={[colors.inkViolet]}
          />
        }>
        <FadeIn delay={0}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
                {greeting},{'\n'}
                {displayFirstName}
              </Text>
              <Text style={[Typography.metadata, {color: colors.textMuted}]}>
                Day score updates as you go — calm pace.
              </Text>
            </View>
            <HapticPressable
              haptic="medium"
              accessibilityRole="button"
              accessibilityLabel="Open profile and sign in"
              onPress={() => rootNavigation.navigate('Profile')}
              style={({pressed}) => (pressed ? {opacity: 0.88} : null)}>
              <View
                style={[
                  styles.avatar,
                  {borderColor: colors.inkViolet, backgroundColor: colors.surfaceRaised},
                  cardShadow(colors),
                ]}>
                <Text style={[Typography.monoNumbers, {color: colors.inkViolet}]}>
                  {initials}
                </Text>
              </View>
            </HapticPressable>
          </View>
        </FadeIn>

        <FadeIn delay={Motion.staggerMs}>
          <DayScoreCard
            score={scoreVal}
            deltaVsYesterday={delta}
            tag={tag}
            onPressBreakdown={() =>
              rootNavigation.navigate('ScoreBreakdown', {dateKey: todayKey})
            }
          />
        </FadeIn>

        <Text
          style={[
            Typography.labelCaps,
            {color: colors.textSecondary, marginTop: Spacing.lg},
          ]}>
          HABITS — {doneCount}/{habits.length || 0} DONE
        </Text>
        {habits.map((h, index) => {
          const lt = logTodayByHabit.get(h.id);
          const ly = logYesterdayByHabit.get(h.id);
          const {state, missedYesterday} = deriveState(lt, ly);
          const schedule = parseSchedule(h.scheduleJson);
          const staggerDelay =
            Motion.staggerMs * 2 + Math.min(index, 10) * Motion.staggerMs;
          return (
            <FadeIn key={h.id} delay={staggerDelay}>
              <HabitRow
                habit={h}
                state={state}
                slotLabel={slotLabel(schedule.slot)}
                missedYesterday={missedYesterday && state !== 'done'}
                graceTokensLeft={h.graceTokens}
                onComplete={() => completeHabitForDay(db, h.id, todayKey)}
                onSkip={() => skipHabitForDay(db, h.id, todayKey)}
                onLongPress={() =>
                  rootNavigation.navigate('HabitDetail', {habitId: h.id})
                }
                onUseGrace={
                  missedYesterday
                    ? () => spendGraceTokenForHabit(db, h, yKey)
                    : undefined
                }
                onForfeitGrace={
                  missedYesterday
                    ? () => forfeitStreakForMissedDay(db, h.id, yKey)
                    : undefined
                }
              />
            </FadeIn>
          );
        })}

        <Text
          style={[
            Typography.labelCaps,
            {color: colors.textSecondary, marginTop: Spacing.lg},
          ]}>
          TASKS — NOW & NEXT
        </Text>
        {openTasks.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            onComplete={() => completeTask(db, t)}
            onDefer={() => deferTaskToLater(db, t)}
            onOpen={() => tabNavigation.navigate('Focus')}
          />
        ))}
        {openTasks.length === 0 ? (
          <Text style={[Typography.body, {color: colors.textMuted}]}>
            No open tasks — add one from the Tasks tab.
          </Text>
        ) : null}

        <View style={styles.miniRow}>
          <View
            style={[
              styles.miniCard,
              cardShadow(colors),
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceRaised,
              },
            ]}>
            <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
              SCREEN TIME
            </Text>
            <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>
              —
            </Text>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              Reader in V2 (platform APIs)
            </Text>
          </View>
          <View
            style={[
              styles.miniCard,
              cardShadow(colors),
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceRaised,
              },
            ]}>
            <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
              FOCUS TODAY
            </Text>
            <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>
              {todayScore?.focusMin ?? 0}m
            </Text>
            <Text style={[Typography.metadata, {color: colors.textMuted}]}>
              logged minutes
            </Text>
          </View>
        </View>

        <FadeIn delay={Motion.staggerMs * 4}>
          <HeatmapStrip
            days={heatmapDays}
            onOpenInsights={() => tabNavigation.navigate('Insights')}
          />
        </FadeIn>

        <HapticPressable
          haptic="light"
          onPress={() => tabNavigation.navigate('Insights')}
          accessibilityRole="button"
          accessibilityLabel="Open insights tab"
          hitSlop={12}
          style={({pressed}) => (pressed ? {opacity: 0.85} : null)}>
          <Text style={[Typography.metadata, {color: colors.inkViolet}]}>
            Swipe insights · weekly correlations live in the Insights tab
          </Text>
        </HapticPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  scroll: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  miniRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginTop: Spacing.md,
  },
  miniCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    gap: Spacing.xs,
  },
});
