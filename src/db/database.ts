import {Database} from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import migrations from './migrations';
import schema from './schema';
import {
  DayScore,
  FocusSession,
  Habit,
  HabitLog,
  ScreenTimeLog,
  Task,
} from './models';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: 'tally',
});

export const database = new Database({
  adapter,
  modelClasses: [Habit, HabitLog, Task, FocusSession, ScreenTimeLog, DayScore],
});
