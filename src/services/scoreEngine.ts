import {Database} from '@nozbe/watermelondb';
import {Q} from '@nozbe/watermelondb';
import {endOfDay, isSameDay, startOfDay} from 'date-fns';
import DayScore from '../db/models/DayScore';
import FocusSession from '../db/models/FocusSession';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import ScreenTimeLog from '../db/models/ScreenTimeLog';
import Task from '../db/models/Task';
import {parseDateKey, toDateKey} from '../utils/dateKey';
import {readMindlessBaselineMin, readScoreWeights} from '../stores/settingsStore';

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/**
 * Computes and persists DayScore for a calendar day — Section 5.2.
 */
export async function computeDayScore(
  db: Database,
  dateKey: string,
): Promise<DayScore> {
  const day = parseDateKey(dateKey);
  const start = startOfDay(day).getTime();
  const end = endOfDay(day).getTime();

  const habits = await db.get<Habit>('habits').query().fetch();
  const habitLogs = await db
    .get<HabitLog>('habit_logs')
    .query(Q.where('date', dateKey))
    .fetch();

  const doneIds = new Set(
    habitLogs.filter(l => l.status === 'done').map(l => l.habitId),
  );

  const habitPct =
    habits.length === 0 ? 1 : doneIds.size / Math.max(1, habits.length);

  const tasks = await db.get<Task>('tasks').query().fetch();

  let scheduled = 0;
  let completedOnDay = 0;
  for (const t of tasks) {
    const completed = t.completedAt != null && isSameDay(t.completedAt, day);
    const isOpen = t.completedAt == null;
    if (completed) {
      scheduled += 1;
      completedOnDay += 1;
    } else if (isOpen && (t.slot !== 'later' || (t.dueAt && isSameDay(t.dueAt, day)))) {
      scheduled += 1;
    }
  }

  const taskPct = scheduled === 0 ? 1 : completedOnDay / scheduled;

  const sessions = await db.get<FocusSession>('focus_sessions').query().fetch();
  let focusMin = 0;
  for (const s of sessions) {
    const endTime = s.endedAt ?? s.startedAt;
    if (endTime >= start && endTime <= end) {
      focusMin += s.durationMin;
    }
  }

  const screenLogs = await db
    .get<ScreenTimeLog>('screen_time_logs')
    .query(Q.where('date', dateKey))
    .fetch();
  const mindlessMin = screenLogs
    .filter(l => l.intentType === 'mindless')
    .reduce((a, l) => a + l.minutes, 0);

  const baseline = readMindlessBaselineMin();
  const screenDelta = Math.max(0, mindlessMin - baseline);

  const w = readScoreWeights();

  const focusTerm =
    w.focus * (clamp(focusMin, 0, 120) / 120) * 100;
  const habitTerm = w.habits * habitPct * 100;
  const taskTerm = w.tasks * taskPct * 100;
  const screenPenalty =
    w.screen * (screenDelta / 60) * 100;

  let raw = habitTerm + taskTerm + focusTerm - screenPenalty;
  raw = clamp(raw, 10, 100);

  const noMeaningfulData =
    habits.length === 0 &&
    tasks.length === 0 &&
    focusMin === 0 &&
    mindlessMin === 0;

  const score = noMeaningfulData ? 10 : Math.round(raw);

  let record: DayScore | undefined;
  await db.write(async () => {
    const existing = await db
      .get<DayScore>('day_scores')
      .query(Q.where('date', dateKey))
      .fetch();
    if (existing.length > 0) {
      await existing[0].update(ds => {
        ds.score = score;
        ds.habitPct = habitPct;
        ds.taskPct = taskPct;
        ds.focusMin = focusMin;
        ds.mindlessMin = mindlessMin;
        ds.screenDelta = screenDelta;
      });
      record = existing[0];
    } else {
      record = await db.get<DayScore>('day_scores').create(ds => {
        ds.date = dateKey;
        ds.score = score;
        ds.habitPct = habitPct;
        ds.taskPct = taskPct;
        ds.focusMin = focusMin;
        ds.mindlessMin = mindlessMin;
        ds.screenDelta = screenDelta;
      });
    }
  });

  return record!;
}

export async function getOrComputeTodayScore(db: Database): Promise<DayScore> {
  const key = toDateKey(new Date());
  return computeDayScore(db, key);
}
