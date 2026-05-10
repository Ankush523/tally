import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTheme} from '../hooks/useTheme';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

const DEFAULT_CAP = 3;

type Props = {
  available: number;
  cap?: number;
};

/**
 * Filled disks = availability (up to cap); label states exact count for screen readers & clarity.
 */
export function GraceTokenDots({available, cap = DEFAULT_CAP}: Props) {
  const {colors} = useTheme();
  const safe = Math.max(0, Math.round(available));
  const slots = Array.from({length: cap}, (_, i) => i < Math.min(safe, cap));

  return (
    <View
      style={styles.row}
      accessibilityRole="text"
      accessibilityLabel={`${safe} grace ${safe === 1 ? 'token' : 'tokens'}`}>
      <View style={styles.dots}>
        {slots.map((filled, i) => (
          <View
            key={i}
            style={[
              styles.disk,
              filled
                ? {backgroundColor: colors.textMuted, borderColor: colors.border}
                : {
                    backgroundColor: 'transparent',
                    borderColor: colors.textMuted,
                  },
            ]}
          />
        ))}
      </View>
      <Text style={[Typography.metadata, {color: colors.textMuted}]}>
        {safe} grace {safe === 1 ? 'token' : 'tokens'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  disk: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
