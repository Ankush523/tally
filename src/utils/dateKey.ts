import {format} from 'date-fns';

export function toDateKey(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

export function parseDateKey(key: string): Date {
  const [y, m, day] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, day ?? 1);
}
