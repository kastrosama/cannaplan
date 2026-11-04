// HomeScreen.js — dashboard of grows.
import React, { useCallback, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import moment from 'moment';

import { useTheme, useStyles, space, radius } from '../theme/theme';
import {
  Screen,
  Wordmark,
  Card,
  T,
  Button,
  SectionTitle,
  PhaseBadge,
  PhaseProgress,
  EmptyState,
  ListRow,
} from '../components/ui';
import { loadAllGrows, setCurrentGrow } from '../utils/growStore';
import { getGrowOverview, getMediumLabel } from '../utils/growHelpers';
import { brandById, brandName } from '../utils/brands';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const [grows, setGrows] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      loadAllGrows()
        .then((list) => alive && setGrows(list.map((g) => ({ ...g, overview: getGrowOverview(g) }))))
        .catch(() => alive && setGrows([]));
      return () => {
        alive = false;
      };
    }, [])
  );

  const openGrow = async (grow) => {
    await setCurrentGrow(grow);
    navigation.navigate('Feeding Schedule');
  };

  const active = (grows || []).filter((g) => g.overview.status === 'active');
  const upcoming = (grows || []).filter((g) => g.overview.status === 'upcoming');
  const finished = (grows || []).filter((g) => g.overview.status === 'finished');

  return (
    <Screen>
      <View style={s.top}>
        <Wordmark />
        <T variant="muted" style={{ marginTop: 6 }}>
          {moment().format('dddd, D MMMM')}
        </T>
      </View>

      {grows && grows.length === 0 ? (
        <Card style={{ marginTop: space.lg }}>
          <EmptyState
            title="Start your first grow"
            message="Pick your nutrients and CannaPlan works out exactly what to mix, week by week."
            action={<Button title="Create a grow plan" icon="add" onPress={() => navigation.navigate('Select Nutrients')} />}
          />
        </Card>
      ) : null}

      {active.length > 0 ? <SectionTitle>Growing now</SectionTitle> : null}
      {active.map((g) => (
        <GrowCard key={g.key} grow={g} onPress={() => openGrow(g)} />
      ))}

      {grows && grows.length > 0 ? (
        <Button
          title="New grow"
          icon="add"
          variant={active.length ? 'secondary' : 'primary'}
          onPress={() => navigation.navigate('Select Nutrients')}
          style={{ marginTop: space.sm }}
        />
      ) : null}

      {upcoming.length > 0 ? <SectionTitle>Upcoming</SectionTitle> : null}
      {upcoming.map((g) => (
        <GrowCard key={g.key} grow={g} onPress={() => openGrow(g)} />
      ))}

      {finished.length > 0 ? (
        <>
          <SectionTitle>Finished</SectionTitle>
          <Card style={{ paddingVertical: 4 }}>
            {finished.slice(0, 5).map((g, i) => (
              <View key={g.key} style={i > 0 && s.divider}>
                <ListRow
                  icon="checkmark-done-outline"
                  title={g.strain || 'Unnamed grow'}
                  subtitle={`${brandName(g.nutrients)} · started ${moment(g.startDate).format('D MMM YYYY')}`}
                  onPress={() => openGrow(g)}
                />
              </View>
            ))}
          </Card>
        </>
      ) : null}

      {grows && grows.length > 0 ? (
        <Button
          title="Manage saved grows"
          variant="ghost"
          onPress={() => navigation.navigate('Previous Grows')}
          style={{ marginTop: space.sm }}
        />
      ) : null}
    </Screen>
  );
}

function GrowCard({ grow, onPress }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const o = grow.overview;
  const brand = brandById(grow.nutrients);
  const kind = o.current?.kind || (o.status === 'upcoming' ? 'veg' : 'harvest');
  const subtitle = [brandName(grow.nutrients), getMediumLabel(grow), grow.type].filter(Boolean).join(' · ');

  return (
    <Card onPress={onPress}>
      <View style={s.cardTop}>
        <View style={{ flex: 1, paddingRight: space.md }}>
          <T variant="title" numberOfLines={1}>{grow.strain || 'Unnamed grow'}</T>
          <T variant="small" numberOfLines={1} style={{ marginTop: 3 }}>{subtitle}</T>
        </View>
        {brand ? (
          <View style={s.logoTile}>
            <Image source={brand.logo} style={s.logo} resizeMode="contain" />
          </View>
        ) : null}
      </View>

      {o.status === 'upcoming' ? (
        <T variant="muted" style={{ marginTop: space.md }}>
          Starts {moment(grow.startDate).format('D MMMM')} · {o.total} weeks
        </T>
      ) : (
        <>
          <View style={s.weekRow}>
            <PhaseBadge kind={kind} label={o.phaseLabel} />
            <T variant="small">Week {Math.min(o.week, o.total)} of {o.total}</T>
          </View>
          <PhaseProgress segments={o.segments} progress={o.progress} />
          <View style={s.cardFoot}>
            <T variant="small">Day {o.day}</T>
            <T variant="small" color={theme.accent}>Open this week's feed →</T>
          </View>
        </>
      )}
    </Card>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    top: { paddingTop: space.lg, paddingBottom: space.sm },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    logoTile: {
      width: 48,
      height: 48,
      borderRadius: radius.sm,
      backgroundColor: t.logoTile,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 5,
    },
    logo: { width: '100%', height: '100%' },
    weekRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      rowGap: space.sm,
      columnGap: space.sm,
      marginTop: space.lg,
      marginBottom: space.md,
    },
    cardFoot: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md },
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
  });
