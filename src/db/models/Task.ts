import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class Task extends Model {
  static table = 'tasks';

  @field('title') title!: string;
  @field('energy_tag') energyTag!: string;
  @field('slot') slot!: string;
  @field('estimated_min') estimatedMin!: number;
  @field('actual_min') actualMin?: number;
  @field('due_at') dueAt?: number;
  @field('completed_at') completedAt?: number;
  @field('recurrence_json') recurrenceJson?: string;
  @field('habit_id') habitId?: string;
  @field('created_at') createdAt!: number;
}
