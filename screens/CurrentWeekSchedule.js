// CurrentWeekSchedule.js — "This week": the mix for the current week as a step-by-step recipe.
import React, { useCallback, useRef, useState } from 'react';
import { View, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Print from 'expo-print';
import { weekPrintHtml } from '../utils/printHtml';
import moment from 'moment';

import { useTheme, useStyles, space, radius, fonts } from '../theme/theme';
import {
  Screen,
  Header,
  Card,
  T,
  Button,
  IconButton,
  PhaseBadge,
  PhaseProgress,
  InfoPill,
  EmptyState,
  SectionTitle,
  ListRow,
} from '../components/ui';
import { getGrowOverview, getMixingRows, getWeekRange, getMediumLabel, parseWater, formatWater, unitWord, GAL } from '../utils/growHelpers';
import { loadReminderConfigs } from '../utils/reminders';
import { describeReminder } from '../utils/reminderPlan';
import { loadAllGrows, getCurrentGrow, setCurrentGrow, resolveGrowKey } from '../utils/growStore';
import { brandName } from '../utils/brands';

export default function CurrentWeekSchedule({ navigation, route }) {
  const { theme, units } = useTheme();
  const refresh = route?.params?.refresh;
  const s = useStyles(makeStyles);
  const shotRef = useRef();

  const [grow, setGrow] = useState(undefined); // undefined = loading, null = none
  const [water, setWater] = useState(NaN);
  const [done, setDone] = useState({});
  const [reminder, setReminder] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        let g = await getCurrentGrow();
        if (!g) {
          const all = await loadAllGrows();
          const active = all.find((x) => getGrowOverview(x).status === 'active');
          if (active) {
            await setCurrentGrow(active);
            g = active;
          }
        }
        if (!alive) return;
        setGrow(g || null);
        setWater(g ? parseWater(g.waterAmount) : NaN);
        setDone({});
        const key = await resolveGrowKey(g);
        const cfgs = await loadReminderConfigs();
        if (alive) setReminder(key ? cfgs[key] || null : null);
      })().catch(() => alive && setGrow(null));
      return () => {
        alive = false;
      };
    }, [refresh])
  );

  if (grow === undefined) return <Screen header={<Header title="This week" />} />;

  if (!grow) {
    return (
      <Screen header={<Header title="This week" />}>
        <Card>
          <EmptyState
            title="No grow selected"
            message="Create a grow plan, or pick one on the Grows tab, to see what to mix this week."
            action={<Button title="Create a grow plan" icon="add" onPress={() => navigation.navigate('Select Nutrients')} />}
          />
        </Card>
      </Screen>
    );
  }

  const o = getGrowOverview(grow);
  const week = o.current;
  const mix = week ? getMixingRows(week, water, units) : { doses: [], sprays: [], readings: [] };
  const litres = formatWater(water, units);
  const per = unitWord(units);
  const toggle = (k) => setDone((d) => ({ ...d, [k]: !d[k] }));
  // Steps of 0.5 L, or 0.5 gal in US mode. Water is always kept in litres.
  const changeWater = (dir) =>
    setWater((w) => {
      const base = isNaN(w) ? 10 : w;
      if (units === 'us') {
        const gal = Math.max(0.5, Math.round((base / GAL + dir * 0.5) * 2) / 2);
        return gal * GAL;
      }
      return Math.max(0.5, Math.round((base + dir * 0.5) * 2) / 2);
    });

  const capture = async () => {
    const uri = await shotRef.current.capture();
    return uri;
  };

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to save the schedule to your gallery.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(await capture());
      Alert.alert('Saved', "This week's feed was saved to your gallery.");
    } catch (e) {
      console.error('Export failed:', e);
      Alert.alert('Error', 'Could not save the image.');
    }
  };

  const print = async () => {
    try {
      await Print.printAsync({ html: weekPrintHtml(grow, water, units) });
    } catch (e) {
      console.error('Print failed:', e);
    }
  };

  const subtitle = [brandName(grow.nutrients), getMediumLabel(grow)].filter(Boolean).join(' · ');
  let step = 1;

  return (
    <Screen header={<Header title="This week" subtitle={grow.strain} />}>
      <ViewShot ref={shotRef} options={{ format: 'jpg', quality: 0.95 }} style={{ backgroundColor: theme.bg }}>
        {/* Overview */}
        <Card>
          <T variant="small">{subtitle}</T>
          {week ? (
            <View style={{ marginTop: space.md }}>
              <PhaseBadge kind={week.kind} label={o.phaseLabel} />
            </View>
          ) : null}
          <View style={s.heroRow}>
            <View style={{ flex: 1 }}>
              <T variant="display">
                {o.status === 'upcoming' ? 'Not started' : o.status === 'finished' ? 'Finished' : `Week ${o.week}`}
              </T>
              <T variant="muted">
                {o.status === 'active'
                  ? `Day ${o.day} · ${getWeekRange(grow.startDate, o.week)}`
                  : o.status === 'upcoming'
                  ? `Starts ${moment(grow.startDate).format('D MMMM')}`
                  : `${o.total} week grow`}
              </T>
            </View>
          </View>
          <PhaseProgress segments={o.segments} progress={o.progress} />
          <View style={s.pills}>
            {o.light !== '-' ? <InfoPill icon="sunny-outline" text={`Light ${o.light}`} /> : null}
            <InfoPill icon="calendar-outline" text={`${o.total} weeks total`} />
            {grow.type ? <InfoPill icon="leaf-outline" text={grow.type} /> : null}
          </View>
        </Card>

        {/* Mix */}
        {week && week.kind !== 'harvest' ? (
          <>
            <SectionTitle
              action={
                <View style={s.stepper}>
                  <Pressable onPress={() => changeWater(-1)} hitSlop={8} style={s.stepBtn}>
                    <Ionicons name="remove" size={18} color={theme.text} />
                  </Pressable>
                  <T variant="heading" style={{ minWidth: 56, textAlign: 'center' }}>{litres}</T>
                  <Pressable onPress={() => changeWater(1)} hitSlop={8} style={s.stepBtn}>
                    <Ionicons name="add" size={18} color={theme.text} />
                  </Pressable>
                </View>
              }
            >
              Mix for
            </SectionTitle>

            <Card style={{ paddingVertical: space.sm }}>
              <MixStep n={step++} title={`Fill with ${litres} of water`} detail="Room temperature, ideally rested" done={done.water} onPress={() => toggle('water')} />

              {week.kind === 'flush'
                ? <MixStep n={step++} title="Water only, no nutrients" detail="Flush week: let the plant use up what's in the medium" done={done.flush} onPress={() => toggle('flush')} />
                : mix.doses.map((r) => (
                    <MixStep
                      key={r.key}
                      n={step++}
                      title={r.key}
                      detail={`${r.perL} per ${per}${r.note ? ` · ${r.note}` : ''}`}
                      amount={r.total}
                      done={done[r.key]}
                      onPress={() => toggle(r.key)}
                    />
                  ))}

              {mix.readings.map((r) => (
                <MixStep
                  key={r.key}
                  n={step++}
                  title={r.key === 'pH' ? 'Adjust pH' : r.key === 'EC' ? 'Check EC' : `Check ${r.label}`}
                  detail={r.key === 'pH' ? 'Always last, after everything is mixed in' : /[–-]/.test(r.perL) ? 'Target range' : 'Target'}
                  amount={r.perL}
                  reading
                  done={done[r.key]}
                  onPress={() => toggle(r.key)}
                />
              ))}
            </Card>

            {mix.sprays.length ? (
              <>
                <SectionTitle>Foliar spray · separate bottle</SectionTitle>
                <Card>
                  {mix.sprays.map((r) => (
                    <View key={r.key} style={s.sprayRow}>
                      <Ionicons name="water-outline" size={18} color={theme.phase.flush} style={{ marginRight: 10 }} />
                      <T variant="body" style={{ flex: 1 }}>{r.key}</T>
                      <T variant="small">{[r.perL, r.note].filter(Boolean).join(' · ')}</T>
                    </View>
                  ))}
                </Card>
              </>
            ) : null}

            <T variant="small" style={s.note}>
              Mixing order is general guidance. If your bottle label says otherwise, follow the label.
            </T>
          </>
        ) : null}

        {week && week.kind === 'harvest' ? (
          <Card accentColor={theme.phase.harvest}>
            <T variant="title">Harvest week</T>
            <T variant="muted" style={{ marginTop: 6 }}>
              No feeding. Check the trichomes, then harvest, dry and cure. Nice work!
            </T>
          </Card>
        ) : null}

        {!week ? (
          <Card>
            <T variant="muted">
              {o.status === 'upcoming'
                ? 'Your schedule starts on the start date. Open the full schedule to see what week 1 looks like.'
                : 'This grow has finished. Start a new one from the New grow tab.'}
            </T>
          </Card>
        ) : null}
      </ViewShot>

      <Card style={{ paddingVertical: 2, marginTop: space.sm }}>
        <ListRow
          icon={reminder ? 'notifications' : 'notifications-outline'}
          title="Feed reminders"
          subtitle={describeReminder(reminder)}
          onPress={() => navigation.navigate('Reminders')}
        />
      </Card>
      <Button title="Full schedule" icon="calendar" variant="secondary" onPress={() => navigation.navigate('FeedingScheduleSummary')} />
      <View style={s.actions}>
        <IconButton icon="image-outline" label="Save image" onPress={saveImage} />
        <IconButton icon="print-outline" label="Print" onPress={print} />
        <IconButton icon="swap-horizontal-outline" label="Switch grow" onPress={() => navigation.navigate('Home')} />
      </View>
    </Screen>
  );
}

function MixStep({ n, title, detail, amount, done, onPress, reading }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [s.step, pressed && { opacity: 0.7 }]}>
      <View style={[s.stepNum, done && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
        {done ? (
          <Ionicons name="checkmark" size={16} color={theme.onAccent} />
        ) : (
          <T variant="small" color={theme.text} style={{ fontFamily: fonts.semibold }}>{n}</T>
        )}
      </View>
      <View style={{ flex: 1, paddingRight: space.sm }}>
        <T variant="heading" style={done && s.doneText}>{title}</T>
        {detail ? <T variant="small" style={{ marginTop: 2 }}>{detail}</T> : null}
      </View>
      {amount ? (
        <T variant={reading ? 'heading' : 'number'} color={reading ? theme.textMuted : theme.text} style={done && s.doneText}>
          {amount}
        </T>
      ) : null}
    </Pressable>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    heroRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginTop: space.xs,
      marginBottom: space.lg,
    },
    pills: { flexDirection: 'row', flexWrap: 'wrap', marginTop: space.lg, marginBottom: -8 },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surface,
      borderRadius: radius.pill,
      paddingHorizontal: 4,
      paddingVertical: 2,
    },
    stepBtn: { padding: 6 },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: t.border,
    },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: space.md,
    },
    doneText: { opacity: 0.45, textDecorationLine: 'line-through' },
    sprayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
    note: { textAlign: 'center', marginTop: space.xs, marginBottom: space.md, paddingHorizontal: space.lg },
    actions: { flexDirection: 'row', marginTop: space.md, marginHorizontal: -4 },
  });
