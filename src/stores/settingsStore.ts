import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {K, kv} from '../storage/mmkv';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

type SettingsState = {
  colorSchemePreference: ColorSchemePreference;
  setColorSchemePreference: (v: ColorSchemePreference) => void;
};

const mmkvStorage = {
  getItem: (key: string) => kv.getString(key) ?? null,
  setItem: (key: string, value: string) => kv.set(key, value),
  removeItem: (key: string) => {
    kv.remove(key);
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    set => ({
      colorSchemePreference: 'system',
      setColorSchemePreference: v => set({colorSchemePreference: v}),
    }),
    {
      name: 'tally-settings',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: s => ({colorSchemePreference: s.colorSchemePreference}),
    },
  ),
);

export function readOnboardingComplete(): boolean {
  return kv.getBoolean(K.onboardingComplete) ?? false;
}

export function writeOnboardingComplete(done: boolean): void {
  kv.set(K.onboardingComplete, done);
}

export function readUserGoal(): string | undefined {
  return kv.getString(K.userGoal);
}

export function writeUserGoal(goal: string): void {
  kv.set(K.userGoal, goal);
}

export function readWakeWindow(): string | undefined {
  return kv.getString(K.wakeWindow);
}

export function writeWakeWindow(w: string): void {
  kv.set(K.wakeWindow, w);
}

export function readDisplayName(): string {
  return kv.getString(K.userDisplayName) ?? 'there';
}

export function writeDisplayName(name: string): void {
  kv.set(K.userDisplayName, name);
}

export function readEnergyPeak(): 'morning' | 'afternoon' | 'evening' {
  const v = kv.getString(K.energyPeak);
  if (v === 'afternoon' || v === 'evening') {
    return v;
  }
  return 'morning';
}

export function writeEnergyPeak(v: 'morning' | 'afternoon' | 'evening'): void {
  kv.set(K.energyPeak, v);
}

export function readMindlessBaselineMin(): number {
  const n = kv.getNumber(K.mindlessBaselineMin);
  return n != null && Number.isFinite(n) && n > 0 ? n : 60;
}

export function readScoreWeights(): {
  habits: number;
  tasks: number;
  focus: number;
  screen: number;
} {
  return {
    habits: kv.getNumber(K.scoreWeightHabits) ?? 0.4,
    tasks: kv.getNumber(K.scoreWeightTasks) ?? 0.35,
    focus: kv.getNumber(K.scoreWeightFocus) ?? 0.15,
    screen: kv.getNumber(K.scoreWeightScreen) ?? 0.1,
  };
}
