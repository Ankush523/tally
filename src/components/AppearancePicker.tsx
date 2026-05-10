import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {
  IconDeviceDesktop,
  IconMoon,
  IconSun,
} from '@tabler/icons-react-native';
import {HapticPressable} from './HapticPressable';
import {useTheme} from '../hooks/useTheme';
import type {ColorSchemePreference} from '../stores/settingsStore';
import {useSettingsStore} from '../stores/settingsStore';
import {Radius} from '../theme/radius';
import {brutalBorderWidth} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Option = {
  value: ColorSchemePreference;
  label: string;
  hint: string;
  Icon: React.ComponentType<{color: string; size?: number; strokeWidth?: number}>;
};

const OPTIONS: Option[] = [
  {
    value: 'system',
    label: 'System',
    hint: 'Match device setting',
    Icon: IconDeviceDesktop,
  },
  {
    value: 'light',
    label: 'Light',
    hint: 'Bright surfaces',
    Icon: IconSun,
  },
  {
    value: 'dark',
    label: 'Dark',
    hint: 'Low glare',
    Icon: IconMoon,
  },
];

export function AppearancePicker() {
  const {colors} = useTheme();
  const preference = useSettingsStore(s => s.colorSchemePreference);
  const setPreference = useSettingsStore(s => s.setColorSchemePreference);

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Appearance"
      style={styles.row}>
      {OPTIONS.map(opt => {
        const selected = preference === opt.value;
        const Icon = opt.Icon;
        return (
          <HapticPressable
            haptic="selection"
            key={opt.value}
            accessibilityRole="radio"
            accessibilityState={{selected, checked: selected}}
            accessibilityLabel={`${opt.label}. ${opt.hint}`}
            onPress={() => setPreference(opt.value)}
            android_ripple={{color: colors.primaryMuted}}
            style={({pressed}) => [
              styles.option,
              {
                borderColor: selected ? colors.inkViolet : colors.border,
                borderWidth: selected ? brutalBorderWidth : 2,
                backgroundColor: selected ? colors.violet50 : colors.sheetSurface,
              },
              pressed ? {opacity: 0.92} : null,
            ]}>
            <Icon
              color={selected ? colors.inkViolet : colors.tabInactive}
              size={22}
              strokeWidth={2.5}
            />
            <Text
              style={[
                Typography.sectionHeader,
                {color: selected ? colors.textPrimary : colors.textSecondary},
              ]}>
              {opt.label}
            </Text>
            <Text style={[Typography.metadata, {color: colors.textMuted}]} numberOfLines={2}>
              {opt.hint}
            </Text>
          </HapticPressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  option: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    minHeight: 100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
    alignItems: 'center',
  },
});
