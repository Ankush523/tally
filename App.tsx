/**
 * Tally — React Native CLI shell (spec Section 6, adapted from Expo).
 */

import {DatabaseProvider} from '@nozbe/watermelondb/react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  Theme as NavTheme,
} from '@react-navigation/native';
import React, {useMemo, useState} from 'react';
import {StatusBar, StyleSheet, useColorScheme} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {database} from './src/db/database';
import {MainNavigator} from './src/navigation/MainNavigator';
import {OnboardingNavigator} from './src/navigation/OnboardingNavigator';
import {
  readOnboardingComplete,
  useSettingsStore,
  writeOnboardingComplete,
} from './src/stores/settingsStore';
import {Colors} from './src/theme/colors';

function App() {
  const systemScheme = useColorScheme();
  const preference = useSettingsStore(s => s.colorSchemePreference);

  const isDark = useMemo(() => {
    if (preference === 'dark') {
      return true;
    }
    if (preference === 'light') {
      return false;
    }
    return systemScheme === 'dark';
  }, [preference, systemScheme]);

  const [onboardingDone, setOnboardingDone] = useState(() =>
    readOnboardingComplete(),
  );

  const navTheme = useMemo((): NavTheme => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const c = isDark ? Colors.dark : Colors.light;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: isDark ? c.graphite : c.parchment,
        card: c.sheetSurface,
        text: c.textPrimary,
        border: c.border,
        primary: c.inkViolet,
      },
    };
  }, [isDark]);

  return (
    <DatabaseProvider database={database}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <NavigationContainer theme={navTheme}>
            <StatusBar
              barStyle={isDark ? 'light-content' : 'dark-content'}
              backgroundColor={navTheme.colors.background}
            />
            {onboardingDone ? (
              <MainNavigator />
            ) : (
              <OnboardingNavigator
                onComplete={() => {
                  writeOnboardingComplete(true);
                  setOnboardingDone(true);
                }}
              />
            )}
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </DatabaseProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});

export default App;
