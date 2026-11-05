// RemindersScreen.js — choose feed days and time for the current grow's reminders.
import React, { useEffect, useState } from 'react';
import { View, Alert, Linking, StyleSheet } from 'react-native';
import moment from 'moment';

import { useTheme, useStyles, space } from '../theme/theme';
import { Screen, Header, Card, T, Button, Chip, SectionTitle, EmptyState } from '../components/ui';
import { getCurrentGrow, resolveGrowKey, getGrowByKey } from '../utils/growStore';
import { getReminderConfig, setReminderConfig, ensureNotificationPermission } from '../utils/reminders';
import { buildReminderPlan, describeReminder, DAY_LABELS, DEFAULT_REMINDER } from '../utils/reminderPlan';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const TIMES = [
  [7, 0],
  [9, 0],
  [12, 0],
  [18, 0],
  [21, 0],
];
const hhmm = (h, m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

export default function RemindersScreen({ navigation }) {
  const { units } = useTheme();
  const s = useStyles(makeStyles);
  const [grow, setGrow] = useState(undefined);
  const [growKey, setGrowKey] = useState(null);
  const [enabled, setEnabled] = useState(false);
  const [cfg, setCfg] = useState(DEFAULT_REMINDER);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const current = await getCurrentGrow();
      const key = await resolveGrowKey(current);
      const saved = key ? await getReminderConfig(key) : null;
      setGrow(key ? await getGrowByKey(key) : null);
      setGrowKey(key);
      if (saved) {
        setCfg(saved);
        setEnabled(true);
      }
    })().catch(() => setGrow(null));
  }, []);

  const toggleDay = (d) =>
    setCfg((c) => ({ ...c, days: c.days.includes(d) ? c.days.filter((x) => x !== d) : [...c.days, d] }));

  const save = async () => {
    setSaving(true);
    try {
      if (enabled) {
        if (!cfg.days.length) {
          Alert.alert('Pick at least one day', 'Choose the days you usually feed.');
          return;
        }
        const ok = await ensureNotificationPermission();
        if (!ok) {
          Alert.alert(
            'Notifications are off',
            'Allow notifications for CannaPlan in your phone settings to get feed reminders.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open settings', onPress: () => Linking.openSettings() },
            ]
          );
          return;
        }
        await setReminderConfig(growKey, cfg);
      } else {
        await setReminderConfig(growKey, null);
      }
      navigation.goBack();
    } catch (e) {
      console.error('Saving reminders failed', e);
      Alert.alert('Error', 'Could not save your reminders.');
    } finally {
      setSaving(false);
    }
  };

  const header = <Header title="Feed reminders" subtitle={grow?.strain} onBack={() => navigation.goBack()} />;

  if (grow === undefined) return <Screen header={header} />;
  if (!grow) {
    return (
      <Screen header={header}>
        <Card>
          <EmptyState title="No grow found" message="Open a saved grow from the Grows tab first, then set reminders for it." />
        </Card>
      </Screen>
    );
  }

  const preview = enabled ? buildReminderPlan(grow, cfg, { units, limit: 3 }) : [];

  return (
    <Screen
      header={header}
      footer={<Button title={enabled ? 'Save reminders' : 'Turn reminders off'} icon="checkmark" onPress={save} disabled={saving} />}
    >
      <Card>
        <T variant="body">
          Get a notification on your feed days showing exactly what to mix that week.
        </T>
        <View style={s.toggleRow}>
          <Chip label="On" selected={enabled} onPress={() => setEnabled(true)} />
          <View style={{ width: space.sm }} />
          <Chip label="Off" selected={!enabled} onPress={() => setEnabled(false)} />
        </View>
      </Card>

      {enabled ? (
        <>
          <SectionTitle>Feed days</SectionTitle>
          <Card>
            <View style={s.wrap}>
              {WEEK_ORDER.map((d) => (
                <View key={d} style={{ padding: 4 }}>
                  <Chip label={DAY_LABELS[d]} selected={cfg.days.includes(d)} onPress={() => toggleDay(d)} />
                </View>
              ))}
            </View>
            <T variant="small" style={{ marginTop: space.sm }}>
              Most growers feed every 2–3 days. Water-only days in between don't need a reminder.
            </T>
          </Card>

          <SectionTitle>Time</SectionTitle>
          <Card>
            <View style={s.wrap}>
              {TIMES.map(([h, m]) => (
                <View key={h} style={{ padding: 4 }}>
                  <Chip
                    label={hhmm(h, m)}
                    selected={cfg.hour === h && cfg.minute === m}
                    onPress={() => setCfg((c) => ({ ...c, hour: h, minute: m }))}
                  />
                </View>
              ))}
            </View>
          </Card>

          <SectionTitle>Coming up · {describeReminder(cfg)}</SectionTitle>
          {preview.length ? (
            preview.map((r) => (
              <Card key={r.date.toISOString()}>
                <T variant="small">{moment(r.date).format('ddd D MMM · HH:mm')}</T>
                <T variant="heading" style={{ marginTop: 4 }}>{r.title}</T>
                <T variant="muted" style={{ marginTop: 2 }}>{r.body}</T>
              </Card>
            ))
          ) : (
            <Card>
              <T variant="muted">No reminders to send. This grow may have finished, or no days are selected.</T>
            </Card>
          )}
        </>
      ) : null}
    </Screen>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    toggleRow: { flexDirection: 'row', marginTop: space.md },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4 },
  });
