import React from 'react';
import {Platform} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '../hooks/useTheme';
import {MainTabs} from './MainTabs';
import type {RootStackParamList} from './types';
import {HabitDetailScreen} from '../screens/HabitDetailScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {ScoreBreakdownScreen} from '../screens/ScoreBreakdownScreen';
const Stack = createNativeStackNavigator<RootStackParamList>();

const headerMono = Platform.select({
  ios: 'JetBrainsMono-Medium',
  android: 'JetBrainsMono_500Medium',
  default: 'JetBrainsMono-Medium',
});

export function MainNavigator() {
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.sheetSurface,
        },
        headerShadowVisible: false,
        headerTintColor: colors.inkViolet,
        headerTitleStyle: {
          fontWeight: '600',
          fontFamily: headerMono,
          color: colors.textPrimary,
          fontSize: 14,
        },
        contentStyle: {backgroundColor: canvas},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="HabitDetail"
        component={HabitDetailScreen}
        options={{title: 'HABIT'}}
      />
      <Stack.Screen
        name="ScoreBreakdown"
        component={ScoreBreakdownScreen}
        options={{title: 'SCORE'}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{title: 'PROFILE'}}
      />
    </Stack.Navigator>
  );
}
