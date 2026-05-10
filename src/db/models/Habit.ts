import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class Habit extends Model {
  static table = 'habits';

  @field('name') name!: string;
  @field('check_mode') checkMode!: string;
  @field('grace_tokens') graceTokens!: number;
  @field('schedule_json') scheduleJson!: string;
  @field('stack_id') stackId?: string;
  @field('stack_order') stackOrder?: number;
  @field('is_negative') isNegative!: boolean;
  @field('seasonal_targets_json') seasonalTargetsJson?: string;
  @field('created_at') createdAt!: number;
  @field('user_id') userId?: string;
}
