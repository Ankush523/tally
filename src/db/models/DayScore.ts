import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class DayScore extends Model {
  static table = 'day_scores';

  @field('date') date!: string;
  @field('score') score!: number;
  @field('habit_pct') habitPct!: number;
  @field('task_pct') taskPct!: number;
  @field('focus_min') focusMin!: number;
  @field('mindless_min') mindlessMin!: number;
  @field('screen_delta') screenDelta!: number;
}
