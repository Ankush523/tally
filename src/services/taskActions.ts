import {Database} from '@nozbe/watermelondb';
import Habit from '../db/models/Habit';
import Task from '../db/models/Task';
import {ParsedTask} from './nlParser';
import {computeDayScore} from './scoreEngine';
import {toDateKey} from '../utils/dateKey';

function inferSlot(dueAt: Date | null): 'now' | 'next' | 'later' {
  if (!dueAt) {
    return 'next';
  }
  const h = dueAt.getHours();
  if (h < 12) {
    return 'now';
  }
  if (h < 17) {
    return 'next';
  }
  return 'later';
}

export async function createTaskFromParsed(
  db: Database,
  parsed: ParsedTask,
): Promise<Task> {
  let created!: Task;
  await db.write(async () => {
    created = await db.get<Task>('tasks').create(t => {
      t.title = parsed.title.trim() || 'Untitled task';
      t.energyTag = parsed.energyTag;
      t.slot = inferSlot(parsed.dueAt);
      t.estimatedMin = parsed.estimatedMin ?? 25;
      t.dueAt = parsed.dueAt?.getTime();
      t.createdAt = Date.now();
    });
  });
  await computeDayScore(db, toDateKey(new Date()));
  return created;
}

export async function completeTask(db: Database, task: Task): Promise<void> {
  await db.write(async () => {
    await task.update(t => {
      t.completedAt = Date.now();
    });
  });
  await computeDayScore(db, toDateKey(new Date()));
}

export async function deferTaskToLater(db: Database, task: Task): Promise<void> {
  await db.write(async () => {
    await task.update(t => {
      t.slot = 'later';
    });
  });
}

export async function convertTaskToHabit(
  db: Database,
  task: Task,
  scheduleJson: string,
): Promise<Habit> {
  let habit!: Habit;
  await db.write(async () => {
    habit = await db.get<Habit>('habits').create(h => {
      h.name = task.title;
      h.checkMode = 'tick';
      h.graceTokens = 0;
      h.scheduleJson = scheduleJson;
      h.isNegative = false;
      h.createdAt = Date.now();
    });
    await task.update(t => {
      t.habitId = habit.id;
    });
  });
  return habit;
}
