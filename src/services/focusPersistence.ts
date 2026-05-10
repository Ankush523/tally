import {Database} from '@nozbe/watermelondb';
import {Q} from '@nozbe/watermelondb';
import FocusSession from '../db/models/FocusSession';
import Task from '../db/models/Task';
import {AmbientSound} from '../stores/focusStore';
import {computeDayScore} from './scoreEngine';
import {toDateKey} from '../utils/dateKey';

export async function persistFocusSession(
  db: Database,
  params: {
    taskId?: string;
    startedAt: number;
    endedAt: number;
    distractions: string[];
    ambient: AmbientSound;
    wasAdaptive: boolean;
  },
): Promise<void> {
  const durationMin = Math.max(
    1,
    Math.round((params.endedAt - params.startedAt) / 60_000),
  );

  await db.write(async () => {
    await db.get<FocusSession>('focus_sessions').create(s => {
      s.taskId = params.taskId;
      s.startedAt = params.startedAt;
      s.endedAt = params.endedAt;
      s.durationMin = durationMin;
      s.distractionsJson = JSON.stringify(params.distractions);
      s.ambientSound = params.ambient === 'off' ? undefined : params.ambient;
      s.wasAdaptive = params.wasAdaptive;
    });

    if (params.taskId) {
      const tasks = await db
        .get<Task>('tasks')
        .query(Q.where('id', params.taskId))
        .fetch();
      const t0 = tasks[0];
      if (t0) {
        await t0.update(t => {
          const prev = t.actualMin ?? 0;
          t.actualMin = prev + durationMin;
        });
      }
    }
  });

  await computeDayScore(db, toDateKey(new Date()));
}
