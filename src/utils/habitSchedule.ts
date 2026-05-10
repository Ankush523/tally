export type ScheduleShape = {
  days: number[];
  slot: 'morning' | 'afternoon' | 'evening' | 'anytime';
  reminder_time?: string;
};

export function parseSchedule(json: string): ScheduleShape {
  try {
    const v = JSON.parse(json) as Partial<ScheduleShape>;
    return {
      days: Array.isArray(v.days) ? v.days : [1, 2, 3, 4, 5, 6, 7],
      slot: v.slot ?? 'anytime',
      reminder_time: v.reminder_time,
    };
  } catch {
    return {days: [1, 2, 3, 4, 5, 6, 7], slot: 'anytime'};
  }
}

export function slotLabel(slot: string): string {
  switch (slot) {
    case 'morning':
      return 'MORNING';
    case 'afternoon':
      return 'AFTERNOON';
    case 'evening':
      return 'EVENING';
    default:
      return 'ANYTIME';
  }
}
