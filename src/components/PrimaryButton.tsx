import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {triggerHaptic} from '../haptics/triggerHaptic';
import {useTheme} from '../hooks/useTheme';
import {useReducedMotionPreference} from '../hooks/useReducedMotionPreference';
import {Motion} from '../theme/motion';
import {Radius} from '../theme/radius';
import {primaryBrutalShadow} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
  accessibilityLabel?: string;
};

/** Neo-brutalist CTA — hard shadow, thick stroke, press “slides into” shadow */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  style,
  accessibilityLabel,
}: Props) {
  const {colors} = useTheme();
  const reduceMotion = useReducedMotionPreference();
  const shift = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shift.value * 3}, {translateY: shift.value * 3}],
  }));

  const bg = variant === 'primary' ? colors.inkViolet : colors.sheetSurface;
  const fg = variant === 'primary' ? colors.onPrimary : colors.textPrimary;
  const border = {borderWidth: 3, borderColor: colors.border};

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{disabled: !!disabled || !!loading}}
      disabled={disabled || loading}
      onPress={onPress}
      onPressIn={() => {
        if (!disabled && !loading) {
          triggerHaptic(variant === 'primary' ? 'medium' : 'light');
        }
        if (!disabled && !loading && !reduceMotion) {
          shift.value = withSpring(1, Motion.pressSpring);
        }
      }}
      onPressOut={() => {
        if (!reduceMotion) {
          shift.value = withSpring(0, Motion.pressSpring);
        }
      }}
      android_ripple={
        variant === 'primary'
          ? {color: 'rgba(255,255,255,0.28)', borderless: false}
          : {color: colors.primaryMuted, borderless: false}
      }
      style={({pressed}) => [
        pressed && variant === 'primary' ? {opacity: 0.96} : null,
        pressed && variant === 'ghost' ? {opacity: 0.9} : null,
        style,
      ]}>
      <Animated.View
        style={[
          styles.base,
          variant === 'primary' ? primaryBrutalShadow(colors) : null,
          {backgroundColor: bg},
          border,
          !reduceMotion ? animStyle : null,
        ]}>
        {loading ? (
          <ActivityIndicator color={fg} />
        ) : (
          <Text style={[Typography.sectionHeader, {color: fg}]}>{label}</Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
