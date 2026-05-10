import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {Radius} from '../theme/radius';
import {cardShadowDropOnly} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

type Props = {
  title: string;
  body: string;
};

export function InsightCard({title, body}: Props) {
  const {colors} = useTheme();
  return (
    <View
      style={[
        styles.card,
        cardShadowDropOnly(colors),
        {
          backgroundColor: colors.surfaceRaised,
          borderColor: colors.border,
        },
      ]}>
      <Text style={[Typography.sectionHeader, {color: colors.inkViolet}]}>{title}</Text>
      <Text style={[Typography.body, {color: colors.textSecondary}]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
});
