import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {IconCircleCheck} from '@tabler/icons-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {OnboardingKicker, OnboardingShell} from '../../components/OnboardingShell';
import {PrimaryButton} from '../../components/PrimaryButton';
import {useTheme} from '../../hooks/useTheme';
import type {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {
  ensureNotificationPermission,
  scheduleDailyHabitReminder,
} from '../../services/notificationScheduler';
import {readWakeWindow} from '../../stores/settingsStore';
import {Radius} from '../../theme/radius';
import {Spacing} from '../../theme/spacing';
import {Typography} from '../../theme/typography';
import {wakeWindowToSchedule} from '../../utils/onboardingSchedule';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Ready'> & {
  onComplete: () => void;
};

export function OnboardingReadyScreen({onComplete}: Props) {
  const {colors} = useTheme();

  useEffect(() => {
    void (async () => {
      const ok = await ensureNotificationPermission();
      if (!ok) {
        return;
      }
      const wake = readWakeWindow() ?? '7-8';
      const {reminderHour, reminderMinute} = wakeWindowToSchedule(wake);
      await scheduleDailyHabitReminder(
        reminderHour,
        reminderMinute,
        'Tally',
        'Your morning stack can start whenever you are ready.',
      );
    })();
  }, []);

  return (
    <OnboardingShell step={3}>
      <View style={styles.center}>
        <OnboardingKicker text="ALL SET" />
        <View
          style={[styles.successRing, {backgroundColor: colors.green50}]}
          accessibilityRole="image"
          accessibilityLabel="Setup complete">
          <IconCircleCheck color={colors.groveGreen} size={56} strokeWidth={2} />
        </View>
        <Text
          style={[Typography.screenTitle, {color: colors.textPrimary}]}
          accessibilityRole="header">
          You&apos;re all set.
        </Text>
        <Text style={[Typography.body, {color: colors.textSecondary}]}>
          Habit created, gentle reminder scheduled, day score tracking on. Nothing to
          configure — start from the dashboard.
        </Text>
        <PrimaryButton
          label="Open my dashboard"
          onPress={() => onComplete()}
          accessibilityLabel="Open dashboard"
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  successRing: {
    width: 96,
    height: 96,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
