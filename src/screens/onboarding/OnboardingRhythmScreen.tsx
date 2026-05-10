import React, {useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {HapticPressable} from '../../components/HapticPressable';
import {OnboardingKicker, OnboardingShell} from '../../components/OnboardingShell';
import {PrimaryButton} from '../../components/PrimaryButton';
import {useTheme} from '../../hooks/useTheme';
import type {OnboardingStackParamList} from '../../navigation/OnboardingNavigator';
import {writeWakeWindow} from '../../stores/settingsStore';
import {Radius} from '../../theme/radius';
import {brutalBorderWidth} from '../../theme/shadows';
import {Spacing} from '../../theme/spacing';
import {Typography} from '../../theme/typography';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Rhythm'>;

const OPTIONS = [
  {label: '5–6am', key: '5-6'},
  {label: '6–7am', key: '6-7'},
  {label: '7–8am', key: '7-8'},
  {label: '8–9am', key: '8-9'},
  {label: '9am+', key: '9+'},
  {label: 'Varies', key: 'varies'},
] as const;

export function OnboardingRhythmScreen({navigation}: Props) {
  const {colors} = useTheme();
  const [selected, setSelected] = useState<string>(OPTIONS[2].key);

  return (
    <OnboardingShell step={1}>
      <View style={styles.center}>
        <OnboardingKicker text="RHYTHM" />
        <Text
          style={[Typography.screenTitle, {color: colors.textPrimary}]}
          accessibilityRole="header">
          When do you usually wake up?
        </Text>
        <View style={styles.options}>
          {OPTIONS.map(opt => {
            const active = selected === opt.key;
            return (
              <HapticPressable
                haptic="selection"
                key={opt.key}
                accessibilityRole="button"
                accessibilityState={{selected: active}}
                accessibilityLabel={opt.label}
                onPress={() => setSelected(opt.key)}
                android_ripple={{color: colors.primaryMuted}}
                style={({pressed}) => [
                  styles.chip,
                  {
                    borderColor: active ? colors.inkViolet : colors.border,
                    backgroundColor: active ? colors.violet50 : colors.surfaceRaised,
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}>
                <Text style={[Typography.body, {color: colors.textPrimary}]}>
                  {opt.label}
                </Text>
              </HapticPressable>
            );
          })}
        </View>
        <PrimaryButton
          label="Continue"
          onPress={() => {
            writeWakeWindow(selected);
            navigation.navigate('FirstHabit');
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
