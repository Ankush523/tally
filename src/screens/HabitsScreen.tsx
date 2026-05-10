import {useDatabase} from '@nozbe/watermelondb/react';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Habit from '../db/models/Habit';
import {IconPlus} from '@tabler/icons-react-native';
import {AppBottomSheetModal} from '../components/AppBottomSheetModal';
import {EmptyState} from '../components/EmptyState';
import {FabButton} from '../components/FabButton';
import {GraceTokenDots} from '../components/GraceTokenDots';
import {HapticPressable} from '../components/HapticPressable';
import {PrimaryButton} from '../components/PrimaryButton';
import {useTheme} from '../hooks/useTheme';
import type {RootStackParamList} from '../navigation/types';
import {createHabit} from '../services/habitActions';
import {Radius} from '../theme/radius';
import {rimThinWidth} from '../theme/shadows';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';
import {parseSchedule, slotLabel} from '../utils/habitSchedule';

export function HabitsScreen() {
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;
  const rootNavigation =
    useNavigation().getParent() as NativeStackNavigationProp<RootStackParamList>;

  const [habits, setHabits] = useState<Habit[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    const sub = db.get<Habit>('habits').query().observe().subscribe(setHabits);
    return () => sub.unsubscribe();
  }, [db]);

  const grouped = [...habits].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
          Habits
        </Text>
        <FabButton
          onPress={() => setOpen(true)}
          accessibilityLabel="Add new habit"
          attention={grouped.length === 0}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: Spacing.xxxl}}>
        {grouped.length === 0 ? (
          <EmptyState
            icon={<IconPlus color={colors.inkViolet} size={28} strokeWidth={2.25} />}
            title="No habits yet"
            hint="Tap + to add your first habit — name it and keep going."
          />
        ) : null}
        {grouped.map(item => {
          const sch = parseSchedule(item.scheduleJson);
          return (
            <HapticPressable
              haptic="light"
              key={item.id}
              onPress={() =>
                rootNavigation.navigate('HabitDetail', {habitId: item.id})
              }
              android_ripple={{color: colors.primaryMuted}}
              style={({pressed}) => [
                styles.row,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.surfaceRaised,
                  borderWidth: rimThinWidth,
                  opacity: pressed ? 0.96 : 1,
                },
              ]}>
              <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
                {slotLabel(sch.slot)}
              </Text>
              <Text style={[Typography.body, styles.rowTitle, {color: colors.textPrimary}]}>
                {item.name}
              </Text>
              <View style={styles.rowMeta}>
                <Text style={[Typography.metadata, {color: colors.textMuted}]}>
                  {item.checkMode}
                </Text>
                <GraceTokenDots available={item.graceTokens} />
              </View>
            </HapticPressable>
          );
        })}
      </ScrollView>

      <AppBottomSheetModal visible={open} onClose={() => setOpen(false)}>
        <Text style={[Typography.sectionHeader, {color: colors.textPrimary}]}>
          New habit
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Habit name"
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.surfaceRaised,
            },
          ]}
        />
        <PrimaryButton
          label="Save"
          onPress={async () => {
            await createHabit(db, {
              name: name.trim() || 'New habit',
              schedule: {
                days: [1, 2, 3, 4, 5, 6, 7],
                slot: 'morning',
              },
            });
            setName('');
            setOpen(false);
          }}
        />
        <PrimaryButton label="Cancel" variant="ghost" onPress={() => setOpen(false)} />
      </AppBottomSheetModal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1, paddingHorizontal: Spacing.lg},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  row: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.25,
    marginTop: 2,
  },
  rowMeta: {
    marginTop: 4,
    gap: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 52,
  },
});
