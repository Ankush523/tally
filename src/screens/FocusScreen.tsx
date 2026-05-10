import {Q} from '@nozbe/watermelondb';
import {useDatabase} from '@nozbe/watermelondb/react';
import React, {useEffect, useMemo, useState} from 'react';
import {ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppBottomSheetModal} from '../components/AppBottomSheetModal';
import {HapticPressable} from '../components/HapticPressable';
import {FocusRing} from '../components/FocusRing';
import {PrimaryButton} from '../components/PrimaryButton';
import Task from '../db/models/Task';
import {useTheme} from '../hooks/useTheme';
import {persistFocusSession} from '../services/focusPersistence';
import {
  AmbientSound,
  useFocusStore,
} from '../stores/focusStore';
import {Radius} from '../theme/radius';
import {Spacing} from '../theme/spacing';
import {Typography} from '../theme/typography';

function formatRemaining(ms: number): string {
  const s = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`;
}

const LENGTHS = [25, 40, 60] as const;
const SOUNDS: AmbientSound[] = [
  'rain',
  'cafe',
  'brown_noise',
  'binaural',
  'off',
];

export function FocusScreen() {
  const db = useDatabase();
  const {colors, isDark} = useTheme();
  const canvas = isDark ? colors.graphite : colors.parchment;

  const phase = useFocusStore(s => s.phase);
  const plannedMin = useFocusStore(s => s.plannedMin);
  const linkedTaskId = useFocusStore(s => s.linkedTaskId);
  const ambient = useFocusStore(s => s.ambient);
  const endsAt = useFocusStore(s => s.endsAt);
  const startedAt = useFocusStore(s => s.startedAt);
  const distractions = useFocusStore(s => s.distractions);
  const elapsedMin = useFocusStore(s => s.elapsedMin);

  const setIdleConfig = useFocusStore(s => s.setIdleConfig);
  const startSession = useFocusStore(s => s.startSession);
  const endSessionEarly = useFocusStore(s => s.endSessionEarly);
  const tick = useFocusStore(s => s.tick);
  const logDistraction = useFocusStore(s => s.logDistraction);
  const resetToIdle = useFocusStore(s => s.resetToIdle);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [distOpen, setDistOpen] = useState(false);
  const [distDraft, setDistDraft] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const sub = db
      .get<Task>('tasks')
      .query(Q.sortBy('created_at', Q.desc))
      .observe()
      .subscribe(setTasks);
    return () => sub.unsubscribe();
  }, [db]);

  const openTasks = useMemo(() => tasks.filter(t => !t.completedAt), [tasks]);

  const deepFirst = useMemo(
    () =>
      openTasks.find(t => t.energyTag === 'deep') ??
      openTasks.find(t => t.slot === 'now') ??
      openTasks[0],
    [openTasks],
  );

  useEffect(() => {
    if (linkedTaskId == null && deepFirst) {
      setIdleConfig({
        plannedMin,
        linkedTaskId: deepFirst.id,
        ambient,
      });
    }
  }, [ambient, deepFirst, linkedTaskId, plannedMin, setIdleConfig]);

  useEffect(() => {
    if (phase !== 'active') {
      return;
    }
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      tick(n);
    }, 1000);
    return () => clearInterval(id);
  }, [phase, tick]);

  useEffect(() => {
    if (!distOpen) {
      return;
    }
    const t = setTimeout(() => {
      setDistOpen(false);
      setDistDraft('');
    }, 3000);
    return () => clearTimeout(t);
  }, [distOpen]);

  const totalMs = plannedMin * 60_000;
  const remainingMs =
    phase === 'active' && endsAt ? Math.max(0, endsAt - now) : totalMs;
  const progress =
    phase === 'active' && endsAt
      ? remainingMs / (endsAt - (startedAt ?? endsAt))
      : 1;

  const linkedTitle =
    tasks.find(t => t.id === linkedTaskId)?.title ?? 'Unlinked session';

  const snapshotAndPersist = async () => {
    const st = useFocusStore.getState();
    if (!st.startedAt) {
      return;
    }
    const ended = Date.now();
    await persistFocusSession(db, {
      taskId: st.linkedTaskId,
      startedAt: st.startedAt,
      endedAt: ended,
      distractions: st.distractions,
      ambient: st.ambient,
      wasAdaptive: false,
    });
  };

  const finishPersist = async () => {
    await snapshotAndPersist();
    resetToIdle();
  };

  const startAnother = async () => {
    const st = useFocusStore.getState();
    const prev = {
      plannedMin: st.plannedMin,
      linkedTaskId: st.linkedTaskId,
      ambient: st.ambient,
    };
    await snapshotAndPersist();
    resetToIdle();
    setIdleConfig(prev);
  };

  if (phase === 'idle') {
    return (
      <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
        <ScrollView contentContainerStyle={styles.idle}>
          <Text style={[Typography.screenTitle, {color: colors.textPrimary}]}>
            Focus
          </Text>
          <Text style={[Typography.metadata, {color: colors.textMuted}]}>
            Linked task (defaults to your deepest open task)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {openTasks.map(t => (
                <HapticPressable
                  haptic="selection"
                  key={t.id}
                  onPress={() =>
                    setIdleConfig({
                      plannedMin,
                      linkedTaskId: t.id,
                      ambient,
                    })
                  }
                  style={[
                    styles.taskChip,
                    {
                      borderColor: colors.border,
                      backgroundColor:
                        linkedTaskId === t.id ? colors.violet50 : colors.sheetSurface,
                    },
                  ]}>
                  <Text style={[Typography.body, {color: colors.textPrimary}]}>
                    {t.title}
                  </Text>
                </HapticPressable>
              ))}
          </ScrollView>

          <Text style={[Typography.labelCaps, {color: colors.textSecondary}]}>
            LENGTH
          </Text>
          <View style={styles.row}>
            {LENGTHS.map(m => (
              <HapticPressable
                haptic="selection"
                key={m}
                onPress={() =>
                  setIdleConfig({
                    plannedMin: m,
                    linkedTaskId,
                    ambient,
                  })
                }
                style={[
                  styles.lenChip,
                  {
                    borderColor: colors.border,
                    backgroundColor:
                      plannedMin === m ? colors.violet50 : colors.sheetSurface,
                  },
                ]}>
                <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>
                  {m}
                </Text>
              </HapticPressable>
            ))}
            <HapticPressable
              haptic="selection"
              onPress={() =>
                setIdleConfig({
                  plannedMin: 90,
                  linkedTaskId,
                  ambient,
                })
              }
              style={[
                styles.lenChip,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    plannedMin === 90 ? colors.violet50 : colors.sheetSurface,
                },
              ]}>
              <Text style={[Typography.monoNumbers, {color: colors.textPrimary}]}>
                open
              </Text>
            </HapticPressable>
          </View>

          <Text style={[Typography.labelCaps, {color: colors.textSecondary}]}>
            AMBIENT (ASSETS IN V2)
          </Text>
          <View style={styles.rowWrap}>
            {SOUNDS.map(s => (
              <HapticPressable
                haptic="selection"
                key={s}
                onPress={() =>
                  setIdleConfig({
                    plannedMin,
                    linkedTaskId,
                    ambient: s,
                  })
                }
                style={[
                  styles.soundChip,
                  {
                    borderColor: colors.border,
                    backgroundColor: ambient === s ? colors.violet50 : colors.sheetSurface,
                  },
                ]}>
                <Text style={[Typography.metadata, {color: colors.textPrimary}]}>
                  {s.replace('_', ' ')}
                </Text>
              </HapticPressable>
            ))}
          </View>

          <PrimaryButton label="Start session" onPress={startSession} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (phase === 'active') {
    return (
      <HapticPressable
        haptic="light"
        style={[styles.full, {backgroundColor: canvas}]}
        onPress={() => setDistOpen(true)}>
        <KeepAwake />
        <View style={styles.activeInner}>
          <FocusRing
            progress={Math.min(1, Math.max(0, progress))}
            label={formatRemaining(remainingMs)}
          />
          <Text style={[Typography.body, {color: colors.textMuted, marginTop: Spacing.md}]}>
            {linkedTitle}
          </Text>
          <View style={styles.activeButtons}>
            <HapticPressable haptic="medium" onPress={endSessionEarly}>
              <Text style={[Typography.sectionHeader, {color: colors.ember}]}>
                End early
              </Text>
            </HapticPressable>
          </View>
        </View>

        <AppBottomSheetModal
          visible={distOpen}
          onClose={() => {
            setDistOpen(false);
            setDistDraft('');
          }}
          sheetMaxHeight="52%">
          <Text style={[Typography.sectionHeader, {color: colors.textPrimary}]}>
            Quick distraction note
          </Text>
          <TextInput
            value={distDraft}
            onChangeText={setDistDraft}
            placeholder="What pulled you away?"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Distraction note"
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.textPrimary,
                backgroundColor: colors.surfaceRaised,
              },
            ]}
            onSubmitEditing={() => {
              if (distDraft.trim()) {
                logDistraction(distDraft.trim());
              }
              setDistOpen(false);
              setDistDraft('');
            }}
          />
        </AppBottomSheetModal>
      </HapticPressable>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, {backgroundColor: canvas}]} edges={['top']}>
      <View style={styles.post}>
        <Text
          style={[
            Typography.heroNumber,
            {color: colors.groveGreen, fontSize: 44},
          ]}>
          {elapsedMin} min
        </Text>
        <Text style={[Typography.body, {color: colors.textSecondary}]}>
          Logged for · {linkedTitle}
        </Text>
        {distractions.length > 0 ? (
          <View style={{marginTop: Spacing.md}}>
            <Text style={[Typography.labelCaps, {color: colors.textMuted}]}>
              DISTRACTIONS
            </Text>
            {distractions.map((d, i) => (
              <Text key={i} style={[Typography.metadata, {color: colors.textPrimary}]}>
                · {d}
              </Text>
            ))}
          </View>
        ) : null}
        <PrimaryButton
          label="Done for now"
          onPress={finishPersist}
          style={{marginTop: Spacing.xl}}
        />
        <PrimaryButton label="Start another" variant="ghost" onPress={startAnother} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {flex: 1},
  idle: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  row: {flexDirection: 'row', gap: Spacing.sm},
  rowWrap: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm},
  taskChip: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    marginRight: Spacing.sm,
    maxWidth: 220,
    minHeight: 48,
    justifyContent: 'center',
  },
  lenChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    minHeight: 40,
    justifyContent: 'center',
  },
  full: {flex: 1},
  activeInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxxl,
  },
  activeButtons: {
    position: 'absolute',
    bottom: Spacing.xxl,
  },
  post: {
    flex: 1,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 52,
  },
});
