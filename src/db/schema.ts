import {appSchema, tableSchema} from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'habits',
      columns: [
        {name: 'name', type: 'string'},
        {name: 'check_mode', type: 'string'},
        {name: 'grace_tokens', type: 'number'},
        {name: 'schedule_json', type: 'string'},
        {name: 'stack_id', type: 'string', isOptional: true},
        {name: 'stack_order', type: 'number', isOptional: true},
        {name: 'is_negative', type: 'boolean'},
        {name: 'seasonal_targets_json', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
        {name: 'user_id', type: 'string', isOptional: true},
      ],
    }),
    tableSchema({
      name: 'habit_logs',
      columns: [
        {name: 'habit_id', type: 'string', isIndexed: true},
        {name: 'date', type: 'string', isIndexed: true},
        {name: 'status', type: 'string'},
        {name: 'value', type: 'number', isOptional: true},
        {name: 'grace_used', type: 'boolean'},
        {name: 'logged_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'tasks',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'energy_tag', type: 'string'},
        {name: 'slot', type: 'string'},
        {name: 'estimated_min', type: 'number'},
        {name: 'actual_min', type: 'number', isOptional: true},
        {name: 'due_at', type: 'number', isOptional: true},
        {name: 'completed_at', type: 'number', isOptional: true},
        {name: 'recurrence_json', type: 'string', isOptional: true},
        {name: 'habit_id', type: 'string', isOptional: true},
        {name: 'created_at', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'focus_sessions',
      columns: [
        {name: 'task_id', type: 'string', isOptional: true},
        {name: 'started_at', type: 'number'},
        {name: 'ended_at', type: 'number', isOptional: true},
        {name: 'duration_min', type: 'number'},
        {name: 'distractions_json', type: 'string'},
        {name: 'ambient_sound', type: 'string', isOptional: true},
        {name: 'was_adaptive', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'screen_time_logs',
      columns: [
        {name: 'date', type: 'string', isIndexed: true},
        {name: 'app_bundle_id', type: 'string'},
        {name: 'app_name', type: 'string'},
        {name: 'minutes', type: 'number'},
        {name: 'intent_type', type: 'string'},
      ],
    }),
    tableSchema({
      name: 'day_scores',
      columns: [
        {name: 'date', type: 'string', isIndexed: true},
        {name: 'score', type: 'number'},
        {name: 'habit_pct', type: 'number'},
        {name: 'task_pct', type: 'number'},
        {name: 'focus_min', type: 'number'},
        {name: 'mindless_min', type: 'number'},
        {name: 'screen_delta', type: 'number'},
      ],
    }),
  ],
});
