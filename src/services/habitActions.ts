import {Database} from '@nozbe/watermelondb';
import {Q} from '@nozbe/watermelondb';
import {subDays} from 'date-fns';
import Habit from '../db/models/Habit';
import HabitLog from '../db/models/HabitLog';
import {toDateKey} from '../utils/dateKey';
import type {ScheduleShape} from '../utils/habitSchedule';
import {computeDayScore} from './scoreEngine';

export type HabitSchedule = ScheduleShape;

export async function createHabit(
  db: Database,
  params: {
    name: string;
    checkMode?: 'tick' | 'count' | 'timer' | 'note';
    schedule: HabitSchedule;
    graceTokens?: number;
  },
): Promise<Habit> {
  let created!: Habit;
  await db.write(async () => {
    created = await db.get<Habit>('habits').create(h => {
      h.name = params.name;
      h.checkMode = params.checkMode ?? 'tick';
      h.graceTokens = params.graceTokens ?? 0;
      h.scheduleJson = JSON.stringify(params.schedule);
      h.isNegative = false;
      h.createdAt = Date.now();
    });
  });
  return created;
}

async function upsertLog(
  db: Database,
  habitId: string,
  dateKey: string,
  mut: (l: HabitLog) => void,
): Promise<void> {
  await db.write(async () => {
    const found = await db
      .get<HabitLog>('habit_logs')
      .query(Q.where('habit_id', habitId), Q.where('date', dateKey))
      .fetch();
    if (found.length > 0) {
      await found[0].update(mut);
    } else {
      await db.get<HabitLog>('habit_logs').create(l => {
        l.habitId = habitId;
        l.date = dateKey;
        l.graceUsed = false;
        l.loggedAt = Date.now();
        mut(l);
      });
    }
  });
}

export async function completeHabitForDay(
  db: Database,
  habitId: string,
  dateKey: string,
): Promise<void> {
  await upsertLog(db, habitId, dateKey, l => {
    l.status = 'done';
    l.loggedAt = Date.now();
  });
  await computeDayScore(db, dateKey);
}

export async function skipHabitForDay(
  db: Database,
  habitId: string,
  dateKey: string,
): Promise<void> {
  await upsertLog(db, habitId, dateKey, l => {
    l.status = 'skipped';
    l.loggedAt = Date.now();
  });
  await computeDayScore(db, dateKey);
}

export async function spendGraceTokenForHabit(
  db: Database,
  habit: Habit,
  missedDateKey: string,
): Promise<void> {
  await db.write(async () => {
    const tokens = habit.graceTokens;
    if (tokens <= 0) {
      return;
    }
    await habit.update(h => {
      h.graceTokens = tokens - 1;
    });
    const found = await db
      .get<HabitLog>('habit_logs')
      .query(Q.where('habit_id', habit.id), Q.where('date', missedDateKey))
      .fetch();
    if (found.length > 0) {
      await found[0].update(l => {
        l.status = 'grace_used';
        l.graceUsed = true;
        l.loggedAt = Date.now();
      });
    } else {
      await db.get<HabitLog>('habit_logs').create(l => {
        l.habitId = habit.id;
        l.date = missedDateKey;
        l.status = 'grace_used';
        l.graceUsed = true;
        l.loggedAt = Date.now();
      });
    }
  });
  await computeDayScore(db, toDateKey(new Date()));
}

export async function forfeitStreakForMissedDay(
  db: Database,
  habitId: string,
  missedDateKey: string,
): Promise<void> {
  await upsertLog(db, habitId, missedDateKey, l => {
    l.status = 'missed';
    l.graceUsed = false;
    l.loggedAt = Date.now();
  });
  await computeDayScore(db, toDateKey(new Date()));
}

export function yesterdayKey(): string {
  return toDateKey(subDays(new Date(), 1));
}

export async function earnGraceMilestone(db: Database, habit: Habit): Promise<void> {
  await db.write(async () => {
    const next = Math.min(3, habit.graceTokens + 1);
    await habit.update(h => {
      h.graceTokens = next;
    });
  });
}
