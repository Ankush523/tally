import {Platform, TextStyle} from 'react-native';

/**
 * JetBrains Mono–forward type system — neo-brutalist / terminal rhythm.
 */
export const FontFamily = {
  interRegular: Platform.select({
    ios: 'Inter-Regular',
    android: 'Inter_400Regular',
    default: 'Inter-Regular',
  }) as string,
  interMedium: Platform.select({
    ios: 'Inter-Medium',
    android: 'Inter_500Medium',
    default: 'Inter-Medium',
  }) as string,
  monoMedium: Platform.select({
    ios: 'JetBrainsMono-Medium',
    android: 'JetBrainsMono_500Medium',
    default: 'JetBrainsMono-Medium',
  }) as string,
};

export const Typography = {
  screenTitle: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 22,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  heroNumber: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 52,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: -2,
  },
  sectionHeader: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.4,
    textTransform: 'uppercase' as const,
  },
  body: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    lineHeight: 20,
    letterSpacing: 0,
  },
  labelCaps: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 10,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
  },
  metadata: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 0.2,
    lineHeight: 15,
  },
  monoNumbers: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: -0.5,
  },
  tabLabel: {
    fontFamily: FontFamily.monoMedium,
    fontSize: 9,
    fontWeight: '500' as TextStyle['fontWeight'],
    letterSpacing: 1.2,
  },
} as const;
