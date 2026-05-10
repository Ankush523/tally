import {create} from 'zustand';

export type FocusPhase = 'idle' | 'active' | 'post';

export type AmbientSound = 'rain' | 'cafe' | 'brown_noise' | 'binaural' | 'off';

type FocusState = {
  phase: FocusPhase;
  plannedMin: number;
  linkedTaskId: string | undefined;
  ambient: AmbientSound;
  startedAt: number | undefined;
  endsAt: number | undefined;
  distractions: string[];
  /** Snapshot when session ended */
  elapsedMin: number;
  setIdleConfig: (cfg: {
    plannedMin: number;
    linkedTaskId?: string;
    ambient: AmbientSound;
  }) => void;
  startSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  endSessionEarly: () => void;
  tick: (now: number) => void;
  logDistraction: (note: string) => void;
  resetToIdle: () => void;
};

export const useFocusStore = create<FocusState>((set, get) => ({
  phase: 'idle',
  plannedMin: 25,
  linkedTaskId: undefined,
  ambient: 'off',
  startedAt: undefined,
  endsAt: undefined,
  distractions: [],
  elapsedMin: 0,

  setIdleConfig: cfg =>
    set({
      plannedMin: cfg.plannedMin,
      linkedTaskId: cfg.linkedTaskId,
      ambient: cfg.ambient,
    }),

  startSession: () => {
    const {plannedMin} = get();
    const now = Date.now();
    set({
      phase: 'active',
      startedAt: now,
      endsAt: now + plannedMin * 60_000,
      distractions: [],
    });
  },

  pauseSession: () => {
    /* timer pause: simplified — keep phase active; UI can freeze endsAt adjustment in V2 */
  },

  resumeSession: () => {},

  endSessionEarly: () => {
    const {startedAt} = get();
    if (!startedAt) {
      return;
    }
    const elapsedMin = Math.max(
      1,
      Math.round((Date.now() - startedAt) / 60_000),
    );
    set({phase: 'post', elapsedMin, endsAt: Date.now()});
  },

  tick: now => {
    const {phase, endsAt} = get();
    if (phase !== 'active' || endsAt == null) {
      return;
    }
    if (now >= endsAt) {
      const {startedAt} = get();
      const elapsedMin = startedAt
        ? Math.max(1, Math.round((endsAt - startedAt) / 60_000))
        : get().plannedMin;
      set({phase: 'post', elapsedMin});
    }
  },

  logDistraction: note =>
    set(s => ({
      distractions: [...s.distractions, note].slice(-12),
    })),

  resetToIdle: () =>
    set({
      phase: 'idle',
      startedAt: undefined,
      endsAt: undefined,
      distractions: [],
      elapsedMin: 0,
    }),
}));
