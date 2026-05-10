import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Task from '../db/models/Task';
import {AppBottomSheetModal} from '../components/AppBottomSheetModal';
import {FabButton} from '../components/FabButton';
import {PrimaryButton} from '../components/PrimaryButton';
import {TaskCard} from '../components/TaskCard';
import {useTheme} from '../hooks/useTheme';
import {parseTaskInput} from '../services/nlParser';
import {completeTask, createTaskFromParsed, deferTaskToLater} from '../services/taskActions';
import {Radius} from '../theme/radius';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <View style={{marginBottom: Spacing.lg}}>
      <Text
        style={[
          Typography.labelCaps,
          {color: colors.textSecondary, marginBottom: Spacing.sm},
        ]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

export function TasksScreen() {
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const parsed = useMemo(() => parseTaskInput(draft), [draft]);

  useEffect(() => {
    const sub = db
      .get<Task>('tasks')
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(setTasks);
    return () => sub.unsubscribe();
  }, [db]);

  const openTasks = tasks.filter(t => !t.completedAt);
  const now = openTasks.filter(t => t.slot === 'now');
  const next = openTasks.filter(t => t.slot === 'next');
  const later = openTasks.filter(t => t.slot === 'later');

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
          Tasks
        </Text>
        <FabButton
          onPress={() => setOpen(true)}
          accessibilityLabel="Add task with natural language"
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollSections}>
      <Section title="NOW" colors={colors}>
        {now.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            onComplete={() => completeTask(db, t)}
            onDefer={() => deferTaskToLater(db, t)}
          />
        ))}
        {now.length === 0 ? (
          <Text style={[Typography.body, {color: colors.textMuted}]}>Nothing queued.</Text>
        ) : null}
      </Section>

      <Section title="NEXT" colors={colors}>
        {next.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            onComplete={() => completeTask(db, t)}
            onDefer={() => deferTaskToLater(db, t)}
          />
        ))}
        {next.length === 0 ? (
          <Text style={[Typography.body, {color: colors.textMuted}]}>Clear runway.</Text>
        ) : null}
      </Section>

      <Section title="LATER" colors={colors}>
        {later.map(t => (
          <TaskCard
            key={t.id}
            task={t}
            onComplete={() => completeTask(db, t)}
            onDefer={() => deferTaskToLater(db, t)}
          />
        ))}
        {later.length === 0 ? (
          <Text style={[Typography.body, {color: colors.textMuted}]}>Park ideas here.</Text>
        ) : null}
      </Section>
      </ScrollView>

      <AppBottomSheetModal
        visible={open}
        onClose={() => setOpen(false)}
        sheetMaxHeight="88%">
        <Text style={[Typography.sectionHeader, {color: colors.textPrimary}]}>
          Add task
        </Text>
        <Text style={[Typography.metadata, {color: colors.textMuted}]}>
          One line is enough — due time and energy are inferred from your wording.
        </Text>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder='Try "Submit report tomorrow at 3pm deep work"'
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Task in natural language"
          style={[
            styles.input,
            {
              borderColor: colors.border,
              color: colors.textPrimary,
              backgroundColor: colors.surfaceRaised,
            },
          ]}
          multiline
        />
        <Text style={[Typography.metadata, {color: colors.textSecondary}]}>
          Parsed · title: {parsed.title || '…'} · energy: {parsed.energyTag}
          {parsed.dueAt ? ` · due: ${parsed.dueAt.toLocaleString()}` : ''}
        </Text>
        <PrimaryButton
          label="Add"
          disabled={!draft.trim()}
          onPress={async () => {
            await createTaskFromParsed(db, parsed);
            setDraft('');
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
  scrollSections: {
    paddingBottom: Spacing.xxxl,
  },
  input: {
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 88,
    textAlignVertical: 'top',
  },
});
