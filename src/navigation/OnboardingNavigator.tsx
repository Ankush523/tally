import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useTheme} from '../hooks/useTheme';
import {OnboardingGoalScreen} from '../screens/onboarding/OnboardingGoalScreen';
import {OnboardingRhythmScreen} from '../screens/onboarding/OnboardingRhythmScreen';
import {OnboardingFirstHabitScreen} from '../screens/onboarding/OnboardingFirstHabitScreen';
import {OnboardingReadyScreen} from '../screens/onboarding/OnboardingReadyScreen';

export type OnboardingStackParamList = {
  Goal: undefined;
  Rhythm: undefined;
  FirstHabit: undefined;
  Ready: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

type Props = {
  onComplete: () => void;
};

export function OnboardingNavigator({onComplete}: Props) {
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {backgroundColor: canvas},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="Goal" component={OnboardingGoalScreen} />
      <Stack.Screen name="Rhythm" component={OnboardingRhythmScreen} />
      <Stack.Screen name="FirstHabit" component={OnboardingFirstHabitScreen} />
      <Stack.Screen name="Ready">
        {props => <OnboardingReadyScreen {...props} onComplete={onComplete} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
