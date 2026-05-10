import type {ScheduleShape} from './habitSchedule';

/** Maps onboarding rhythm answers (Section 4.1) to default habit schedule + reminder */
export function wakeWindowToSchedule(wake: string): {
  schedule: ScheduleShape;
  reminderHour: number;
  reminderMinute: number;
  energyPeak: 'morning' | 'afternoon' | 'evening';
} {
  switch (wake) {
    case '5-6':
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'morning', reminder_time: '05:45'},
        reminderHour: 5,
        reminderMinute: 45,
        energyPeak: 'morning',
      };
    case '6-7':
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'morning', reminder_time: '06:30'},
        reminderHour: 6,
        reminderMinute: 30,
        energyPeak: 'morning',
      };
    case '7-8':
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'morning', reminder_time: '07:15'},
        reminderHour: 7,
        reminderMinute: 15,
        energyPeak: 'morning',
      };
    case '8-9':
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'morning', reminder_time: '08:00'},
        reminderHour: 8,
        reminderMinute: 0,
        energyPeak: 'morning',
      };
    case '9+':
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'morning', reminder_time: '09:00'},
        reminderHour: 9,
        reminderMinute: 0,
        energyPeak: 'morning',
      };
    default:
      return {
        schedule: {days: [1, 2, 3, 4, 5, 6, 7], slot: 'anytime', reminder_time: '07:30'},
        reminderHour: 7,
        reminderMinute: 30,
        energyPeak: 'afternoon',
      };
  }
}
