import {Easing} from 'react-native-reanimated';

/** Snappy neo-brutalist motion — stiff springs, short durations */
export const Motion = {
  habitSpring: {damping: 20, stiffness: 260, mass: 0.65},
  milestoneSpring: {damping: 18, stiffness: 240, mass: 0.85},
  pressSpring: {damping: 22, stiffness: 520, mass: 0.32},
  tabSpring: {damping: 20, stiffness: 460, mass: 0.28},
  entranceSpring: {damping: 26, stiffness: 400, mass: 0.5},
  scoreEaseOut: Easing.out(Easing.cubic),
  transitionEase: Easing.inOut(Easing.cubic),
  taskStrikethroughDurationMs: 380,
  screenTransitionMs: 280,
  scoreTickMs: 640,
  /** Day score card border pulse — in/out (keep ≤ ~400ms total feel) */
  scorePulseInMs: 160,
  scorePulseOutMs: 320,
  milestoneMs: 760,
  habitSwipeMs: 280,
  pressInMs: 70,
  pressOutMs: 200,
  fadeInMs: 260,
  staggerMs: 42,
  modalInMs: 260,
  modalOutMs: 190,
} as const;
