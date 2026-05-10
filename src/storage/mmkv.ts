import {createMMKV} from 'react-native-mmkv';

export const kv = createMMKV({id: 'tally-prefs'});

export const K = {
  onboardingComplete: 'onboarding_complete',
  userGoal: 'user_goal',
  wakeWindow: 'wake_window',
  userDisplayName: 'user_display_name',
  energyPeak: 'energy_peak',
  mindlessBaselineMin: 'mindless_baseline_min',
  scoreWeightHabits: 'score_weight_habits',
  scoreWeightTasks: 'score_weight_tasks',
  scoreWeightFocus: 'score_weight_focus',
  scoreWeightScreen: 'score_weight_screen',
} as const;
