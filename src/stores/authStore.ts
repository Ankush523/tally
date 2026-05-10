import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {kv} from '../storage/mmkv';

type AuthState = {
  isLoggedIn: boolean;
  /** Set on sample login — not synced to any server */
  sampleEmail: string;
  login: (email: string) => void;
  logout: () => void;
};

const mmkvStorage = {
  getItem: (key: string) => kv.getString(key) ?? null,
  setItem: (key: string, value: string) => kv.set(key, value),
  removeItem: (key: string) => {
    kv.remove(key);
  },
};

/** Demo auth only — replace with real auth + API later */
export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isLoggedIn: false,
      sampleEmail: '',
      login: email =>
        set({
          isLoggedIn: true,
          sampleEmail: email.trim(),
        }),
      logout: () =>
        set({
          isLoggedIn: false,
          sampleEmail: '',
        }),
    }),
    {
      name: 'tally-auth',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: s => ({
        isLoggedIn: s.isLoggedIn,
        sampleEmail: s.sampleEmail,
      }),
    },
  ),
);
