import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class FocusSession extends Model {
  static table = 'focus_sessions';

  @field('task_id') taskId?: string;
  @field('started_at') startedAt!: number;
  @field('ended_at') endedAt?: number;
  @field('duration_min') durationMin!: number;
  @field('distractions_json') distractionsJson!: string;
  @field('ambient_sound') ambientSound?: string;
  @field('was_adaptive') wasAdaptive!: boolean;
}
