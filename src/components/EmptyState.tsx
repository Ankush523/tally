import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {Radius} from '../theme/radius';
import {rimThinWidth} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = {
  icon: React.ReactNode;
  title: string;
  hint: string;
};

/** Restrained empty surface — brutal square frame, no pill cliché */
export function EmptyState({icon, title, hint}: Props) {
  const {colors} = useTheme();
  const a11y = `${title}. ${hint}`;
  return (
    <View
      style={styles.wrap}
      accessibilityRole="none"
      accessibilityLabel={a11y}
      accessible>
      <View
        style={[
          styles.iconFrame,
          {
            borderColor: colors.border,
            backgroundColor: colors.surfaceRaised,
          },
        ]}>
        {icon}
      </View>
      <Text style={[Typography.body, styles.title, {color: colors.textPrimary}]}>
        {title}
      </Text>
      <Text style={[Typography.metadata, {color: colors.textSecondary, textAlign: 'center'}]}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  iconFrame: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    borderWidth: rimThinWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
});
