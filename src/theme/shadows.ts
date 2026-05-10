import {Platform, ViewStyle} from 'react-native';
import type {ThemeColors} from './colors';

const isDark = (colors: ThemeColors) => colors.scheme === 'dark';

/**
 * Hard-offset neo-brutalist shadow. Dark uses **moon frost** (`colors.brutalShadow`):
 * soft blue-white slab — inverse of light’s black chip, without glare.
 */
export function brutalShadow(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 6} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 5, height: 5},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

export function cardShadow(colors: ThemeColors): ViewStyle {
  return brutalShadow(colors);
}

export function cardShadowSoft(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 4} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 3, height: 3},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

/** Bottom-only drop — keeps insight cards clean horizontally in both modes. */
export function cardShadowDropOnly(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 3} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

export function tabBarShadow(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 12} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

export function fabShadow(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 8} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

export function primaryBrutalShadow(colors: ThemeColors): ViewStyle {
  if (Platform.OS === 'android') {
    return isDark(colors) ? {elevation: 10} : {elevation: 0};
  }
  return {
    shadowColor: colors.brutalShadow,
    shadowOffset: {width: 4, height: 4},
    shadowOpacity: 1,
    shadowRadius: 0,
  };
}

export const brutalBorderWidth = 3;

export const rimThinWidth = 2;
