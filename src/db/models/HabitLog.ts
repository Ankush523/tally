import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class HabitLog extends Model {
  static table = 'habit_logs';

  @field('habit_id') habitId!: string;
  @field('date') date!: string;
  @field('status') status!: string;
  @field('value') value?: number;
  @field('grace_used') graceUsed!: boolean;
  @field('logged_at') loggedAt!: number;
}
