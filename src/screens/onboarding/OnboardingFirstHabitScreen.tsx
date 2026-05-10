import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useDatabase} from '@nozbe/watermelondb/react';
import {HapticPressable} from '../../components/HapticPressable';
import {OnboardingKicker, OnboardingShell} from '../../components/OnboardingShell';
import {PrimaryButton} from '../../components/PrimaryButton';
import {useTheme} from '../../hooks/useTheme';
import type {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {createHabit} from '../../services/habitActions';
import {
  readWakeWindow,
  writeEnergyPeak,
} from '../../stores/settingsStore';
import {Radius} from '../../theme/radius';
import {brutalBorderWidth} from '../../theme/shadows';
import {Spacing} from '../../theme/spacing';
import {Typography} from '../../theme/typography';
import {wakeWindowToSchedule} from '../../utils/onboardingSchedule';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'FirstHabit'>;

const CHIPS = [
  'Morning journal',
  '30 min walk',
  'Read 20 pages',
  'Drink 2L water',
  'No phone before 9am',
];

export function OnboardingFirstHabitScreen({navigation}: Props) {
  const db = useDatabase();
  const {colors} = useTheme();
  const [name, setName] = useState('Morning journal');

  return (
    <OnboardingShell step={2}>
      <View style={styles.center}>
        <OnboardingKicker text="FIRST HABIT" />
        <Text
          style={[Typography.screenTitle, {color: colors.textPrimary}]}
          accessibilityRole="header">
          Name one habit to start with.
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your habit"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Habit name"
          style={[
            styles.input,
            {
              color: colors.textPrimary,
              borderColor: colors.border,
              backgroundColor: colors.surfaceRaised,
            },
          ]}
        />
        <View style={styles.chips}>
          {CHIPS.map(c => (
            <HapticPressable
              haptic="selection"
              key={c}
              accessibilityRole="button"
              accessibilityLabel={`Use suggestion ${c}`}
              onPress={() => setName(c)}
              android_ripple={{color: colors.primaryMuted}}
              style={({pressed}) => [
                styles.mini,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.sheetSurface,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              <Text style={[Typography.metadata, {color: colors.inkViolet}]}>{c}</Text>
            </HapticPressable>
          ))}
        </View>
        <PrimaryButton
          label="Continue"
          onPress={async () => {
            const wake = readWakeWindow() ?? '7-8';
            const {schedule, energyPeak} = wakeWindowToSchedule(wake);
            writeEnergyPeak(energyPeak);
            await createHabit(db, {
              name: name.trim() || 'Morning journal',
              schedule,
              graceTokens: 1,
            });
            navigation.navigate('Ready');
          }}
        />
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.md,
  },
  input: {
    borderWidth: 2,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: 16,
    minHeight: 52,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  mini: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: brutalBorderWidth,
    minHeight: 40,
    justifyContent: 'center',
  },
});
