// FeedingScheduleSummary.js — the whole grow as a phase-coloured timeline + week cards.
import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Print from 'expo-print';
import { schedulePrintHtml } from '../utils/printHtml';
import moment from 'moment';

import { useTheme, useStyles, space, radius, fonts } from '../theme/theme';
import { Screen, Header, Card, T, IconButton, PhaseBadge, phaseColor } from '../components/ui';
import { getGrowOverview, getMixingRows, getMediumLabel, parseWater, formatWater, unitShort } from '../utils/growHelpers';
import { getCurrentGrow } from '../utils/growStore';
import { brandName } from '../utils/brands';

const LEGEND = [
  ['veg', 'Veg'],
  ['flower', 'Flower'],
  ['flush', 'Flush'],
  ['harvest', 'Harvest'],
];

export default function FeedingScheduleSummary({ navigation }) {
  const { theme, units } = useTheme();
  const s = useStyles(makeStyles);
  const scrollRef = useRef();
  const shotRef = useRef();
  const positions = useRef({});
  const shotY = useRef(0);
  const [grow, setGrow] = useState(null);

  useEffect(() => {
    getCurrentGrow().then(setGrow).catch(() => {});
  }, []);

  if (!grow) return <Screen header={<Header title="Full schedule" onBack={() => navigation.goBack()} />} />;

  const o = getGrowOverview(grow);
  const water = parseWater(grow.waterAmount);
  const jumpTo = (w) => {
    const y = positions.current[w];
    if (y != null) scrollRef.current?.scrollTo({ y: shotY.current + y - 8, animated: true });
  };

  const saveImage = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Allow photo access to save the schedule to your gallery.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(await shotRef.current.capture());
      Alert.alert('Saved', 'Feeding schedule saved to your gallery.');
    } catch (e) {
      console.error('Error saving image:', e);
      Alert.alert('Error', 'Could not save the image.');
    }
  };

  const print = async () => {
    try {
      await Print.printAsync({ html: schedulePrintHtml(grow, units) });
    } catch (e) {
      console.error('Print failed:', e);
      Alert.alert('Error', 'Could not create the printout.');
    }
  };

  return (
    <Screen
      scrollRef={scrollRef}
      header={
        <Header
          title="Full schedule"
          subtitle={`${grow.strain} · ${o.total} weeks`}
          onBack={() => navigation.goBack()}
        />
      }
    >
      {/* Timeline strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.strip}>
        {o.schedule.map((w) => {
          const c = phaseColor(theme, w.kind);
          const isNow = w.week === o.week;
          return (
            <Pressable key={w.week} onPress={() => jumpTo(w.week)} style={[s.pill, { backgroundColor: c + (isNow ? 'FF' : '33') }]}>
              <T variant="small" color={isNow ? theme.onAccent : c} style={{ fontFamily: fonts.bold }}>{w.week}</T>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={s.legend}>
        {LEGEND.map(([k, label]) => (
          <View key={k} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: theme.phase[k] }]} />
            <T variant="small">{label}</T>
          </View>
        ))}
      </View>

      <ViewShot
        ref={shotRef}
        options={{ format: 'jpg', quality: 0.95 }}
        style={{ backgroundColor: theme.bg }}
        onLayout={(e) => (shotY.current = e.nativeEvent.layout.y)}
      >
        <Card>
          <T variant="heading">{grow.strain}</T>
          <T variant="small" style={{ marginTop: 3 }}>
            {[brandName(grow.nutrients), getMediumLabel(grow), grow.type].filter(Boolean).join(' · ')}
          </T>
          <T variant="small" style={{ marginTop: 3 }}>
            Started {moment(grow.startDate).format('D MMM YYYY')} · {formatWater(water, units)} per feed
          </T>
        </Card>

        {o.schedule.map((w) => {
          const mix = getMixingRows(w, water, units);
          const isNow = w.week === o.week;
          const isPast = w.week < o.week;
          return (
            <View key={w.week} onLayout={(e) => (positions.current[w.week] = e.nativeEvent.layout.y)}>
              <Card
                accentColor={phaseColor(theme, w.kind)}
                style={[isPast && { opacity: 0.55 }, isNow && { borderWidth: 1.5, borderColor: theme.accent }]}
              >
                <View style={s.weekHead}>
                  <View>
                    <T variant="heading">Week {w.week}{isNow ? ' · now' : ''}</T>
                    <T variant="small" style={{ marginTop: 2 }}>
                      {moment(grow.startDate).add(w.week - 1, 'weeks').format('D MMM')}
                      {w.stage ? ` · ${w.stage}` : ''}
                    </T>
                  </View>
                  <PhaseBadge kind={w.kind} label={w.phase.replace(' Week', '')} />
                </View>

                {w.kind === 'flush' ? <T variant="muted">Water only</T> : null}
                {w.kind === 'harvest' ? <T variant="muted">No feeding · harvest, dry and cure</T> : null}

                {w.kind !== 'flush' && w.kind !== 'harvest'
                  ? mix.doses.map((r) => (
                      <View key={r.key} style={s.row}>
                        <View style={{ flex: 1, paddingRight: space.md }}>
                          <T variant="body" numberOfLines={1}>{r.key}</T>
                          <T variant="small">{r.text ? r.perL : `${r.perL}/${unitShort(units)}`}{r.note ? ` · ${r.note}` : ''}</T>
                        </View>
                        <T variant="heading" style={s.total}>{r.total}</T>
                      </View>
                    ))
                  : null}
                {mix.sprays.map((r) => (
                  <View key={r.key} style={s.row}>
                    <View style={{ flex: 1, paddingRight: space.md }}>
                      <T variant="body" numberOfLines={1}>{r.key}</T>
                      <T variant="small">Foliar spray · separate bottle</T>
                    </View>
                    <T variant="small" style={s.total}>{[r.perL, r.note].filter(Boolean).join(' · ')}</T>
                  </View>
                ))}
                {mix.readings.length ? (
                  <View style={s.readings}>
                    {mix.readings.map((r) => (
                      <T key={r.key} variant="small" style={{ marginRight: space.lg }}>
                        {r.label} <T variant="small" color={theme.text} style={{ fontFamily: fonts.semibold }}>{r.perL}</T>
                      </T>
                    ))}
                  </View>
                ) : null}
              </Card>
            </View>
          );
        })}
      </ViewShot>

      <View style={s.actions}>
        <IconButton icon="image-outline" label="Save image" onPress={saveImage} />
        <IconButton icon="print-outline" label="Print" onPress={print} />
      </View>
    </Screen>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    strip: { paddingVertical: space.xs, paddingRight: space.lg },
    pill: {
      width: 34,
      height: 34,
      borderRadius: radius.sm,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 6,
    },
    legend: { flexDirection: 'row', marginTop: space.sm, marginBottom: space.lg },
    legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: space.lg },
    legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    weekHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: space.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 7,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.border,
    },
    total: { textAlign: 'right' },
    readings: { flexDirection: 'row', flexWrap: 'wrap', paddingTop: space.sm, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
    actions: { flexDirection: 'row', marginTop: space.md, marginHorizontal: -4 },
  });
