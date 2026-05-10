import notifee, {AndroidImportance, RepeatFrequency, TimestampTrigger, TriggerType} from '@notifee/react-native';
import {Platform} from 'react-native';

export async function ensureNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return settings.authorizationStatus >= 1;
}

/**
 * Schedules a repeating daily reminder at HH:mm local time.
 */
export async function scheduleDailyHabitReminder(
  hour: number,
  minute: number,
  title: string,
  body: string,
): Promise<string> {
  await notifee.createChannel({
    id: 'habits',
    name: 'Habits',
    importance: AndroidImportance.DEFAULT,
  });

  const now = new Date();
  const first = new Date(now);
  first.setHours(hour, minute, 0, 0);
  if (first.getTime() <= now.getTime()) {
    first.setDate(first.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: first.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };

  return notifee.createTriggerNotification(
    {
      title,
      body,
      android: {
        channelId: 'habits',
        pressAction: {id: 'default'},
      },
      ios: {sound: 'default'},
    },
    trigger,
  );
}

export async function cancelAllHabitReminders(): Promise<void> {
  await notifee.cancelTriggerNotifications();
}

export function openAndroidUsageSettings(): void {
  if (Platform.OS === 'android') {
    // Screen time on Android needs PACKAGE_USAGE_STATS — deep link in V2 native module
  }
}
