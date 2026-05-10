import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HapticPressable} from '../../components/HapticPressable';
import {OnboardingKicker, OnboardingShell} from '../../components/OnboardingShell';
import {PrimaryButton} from '../../components/PrimaryButton';
import {useTheme} from '../../hooks/useTheme';
import type {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {writeUserGoal} from '../../stores/settingsStore';
import {Radius} from '../../theme/radius';
import {brutalBorderWidth} from '../../theme/shadows';
import {Spacing} from '../../theme/spacing';
import {Typography} from '../../theme/typography';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goal'>;

const OPTIONS = [
  'Build better habits',
  'Get tasks under control',
  'Cut screen time',
  'All of the above',
] as const;

export function OnboardingGoalScreen({navigation}: Props) {
  const {colors} = useTheme();
  const [selected, setSelected] = useState<string>(OPTIONS[0]);

  return (
    <OnboardingShell step={0}>
      <View style={styles.center}>
        <OnboardingKicker text="YOUR FOCUS" />
        <Text
          style={[Typography.screenTitle, {color: colors.textPrimary}]}
          accessibilityRole="header">
          What&apos;s your main focus right now?
        </Text>
        <View style={styles.options}>
          {OPTIONS.map(opt => {
            const active = selected === opt;
            return (
              <HapticPressable
                haptic="selection"
                key={opt}
                accessibilityRole="button"
                accessibilityState={{selected: active}}
                accessibilityLabel={opt}
                onPress={() => setSelected(opt)}
                android_ripple={{color: colors.primaryMuted}}
                style={({pressed}) => [
                  styles.chip,
                  {
                    borderColor: active ? colors.inkViolet : colors.border,
                    backgroundColor: active ? colors.violet50 : colors.surfaceRaised,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={[Typography.body, {color: colors.textPrimary}]}>{opt}</Text>
              </HapticPressable>
            );
          })}
        </View>
        <PrimaryButton
          label="Continue"
          onPress={() => {
            writeUserGoal(selected);
            navigation.navigate('Rhythm');
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
    gap: Spacing.lg,
  },
  options: {
    gap: Spacing.sm,
  },
  chip: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: brutalBorderWidth,
    justifyContent: 'center',
  },
});
