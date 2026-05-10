import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {Colors, ThemeColors} from '../theme/colors';
import {useSettingsStore} from '../stores/settingsStore';

export type Theme = {
  colors: ThemeColors;
  isDark: boolean;
};

/**
 * Returns palette for the active appearance.
 * Respects user preference when set; otherwise follows system.
 */
export function useTheme(): Theme {
  const system = useColorScheme();
  const preference = useSettingsStore(s => s.colorSchemePreference);

  const isDark = useMemo(() => {
    if (preference === 'dark') {
      return true;
    }
    if (preference === 'light') {
      return false;
    }
    return system === 'dark';
  }, [preference, system]);

  const colors = isDark ? Colors.dark : Colors.light;

  return useMemo(() => ({colors, isDark}), [colors, isDark]);
}
