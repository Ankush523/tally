import {Model} from '@nozbe/watermelondb';
import {field} from '@nozbe/watermelondb/decorators';

export default class ScreenTimeLog extends Model {
  static table = 'screen_time_logs';

  @field('date') date!: string;
  @field('app_bundle_id') appBundleId!: string;
  @field('app_name') appName!: string;
  @field('minutes') minutes!: number;
  @field('intent_type') intentType!: string;
}
