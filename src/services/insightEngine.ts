import {Database} from '@nozbe/watermelondb';
import {Q} from '@nozbe/watermelondb';
import {subDays} from 'date-fns';
import DayScore from '../db/models/DayScore';
import HabitLog from '../db/models/HabitLog';
import {toDateKey} from '../utils/dateKey';

export type InsightCard = {
  id: string;
  title: string;
  body: string;
  coefficient: number;
};

function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) {
    return 0;
  }
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const vx = xs[i] - mx;
    const vy = ys[i] - my;
    num += vx * vy;
    dx += vx * vx;
    dy += vy * vy;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? 0 : num / den;
}

/**
 * Lightweight correlation insights — Section 3.7 (client-side, last N days).
 */
export async function computeCorrelationInsights(
  db: Database,
  days = 28,
): Promise<InsightCard[]> {
  const today = new Date();
  const keys: string[] = [];
  for (let i = 0; i < days; i++) {
    keys.push(toDateKey(subDays(today, i)));
  }

  const scores = await db
    .get<DayScore>('day_scores')
    .query(Q.where('date', Q.oneOf(keys)))
    .fetch();
  const scoreByDate = new Map(scores.map(s => [s.date, s.score]));

  const logs = await db
    .get<HabitLog>('habit_logs')
    .query(Q.where('date', Q.oneOf(keys)))
    .fetch();

  const habitDoneByDate = new Map<string, number>();
  for (const k of keys) {
    habitDoneByDate.set(k, 0);
  }
  for (const l of logs) {
    if (l.status !== 'done') {
      continue;
    }
    habitDoneByDate.set(l.date, (habitDoneByDate.get(l.date) ?? 0) + 1);
  }

  const xs: number[] = [];
  const ys: number[] = [];
  for (const k of keys) {
    const sc = scoreByDate.get(k);
    if (sc == null) {
      continue;
    }
    xs.push(habitDoneByDate.get(k) ?? 0);
    ys.push(sc);
  }

  const r = pearson(xs, ys);
  const cards: InsightCard[] = [];

  if (Math.abs(r) >= 0.35 && xs.length >= 7) {
    cards.push({
      id: 'habit-score-corr',
      title: 'Habits & day score',
      body:
        r > 0
          ? 'Days with more habits checked tend to align with higher day scores.'
          : 'When fewer habits get checked, your day score pattern dips — worth watching.',
      coefficient: r,
    });
  }

  const avgScore =
    ys.length === 0 ? 0 : ys.reduce((a, b) => a + b, 0) / ys.length;
  cards.push({
    id: 'avg-score-window',
    title: 'Recent average',
    body: `Average day score over the last ${keys.length} days: ${avgScore.toFixed(0)}.`,
    coefficient: 0,
  });

  return cards.slice(0, 3);
}

export function generateMonthlyNarrative(params: {
  monthLabel: string;
  avgScore: number;
  prevAvg: number;
  topHabitName?: string;
}): string {
  const delta = params.avgScore - params.prevAvg;
  const trend =
    delta >= 3 ? 'up' : delta <= -3 ? 'down' : 'steady';
  const habitBit = params.topHabitName
    ? ` "${params.topHabitName}" stayed on the calendar.`
    : '';
  return `${params.monthLabel}: solid rhythm — average day score ${params.avgScore.toFixed(
    0,
  )}, trending ${trend} vs last month.${habitBit}`;
}
