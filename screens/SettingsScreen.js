// SettingsScreen.js — appearance, data and about.
import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cancelAllReminders, rescheduleAllReminders } from '../utils/reminders';

import { useTheme, useStyles, space } from '../theme/theme';
import { Screen, Header, Card, T, ChipGroup, SectionTitle, ListRow } from '../components/ui';

const APP_VERSION = require('../app.json').expo.version;

export default function SettingsScreen({ navigation }) {
  const { preference, setPreference, units, setUnits } = useTheme();
  const s = useStyles(makeStyles);

  const handleDeleteAll = () => {
    Alert.alert(
      'Delete all data',
      'This permanently deletes every saved grow and resets the app. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelAllReminders();
              await AsyncStorage.clear();
              setPreference(preference); // keep the chosen appearance and units
              setUnits(units);
              Alert.alert('Done', 'All data has been cleared.');
            } catch (e) {
              console.error('Failed to clear storage:', e);
              Alert.alert('Error', 'Something went wrong while resetting.');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen header={<Header title="Settings" />}>
      <SectionTitle>Appearance</SectionTitle>
      <Card>
        <ChipGroup
          options={[
            { label: 'Dark', value: 'dark' },
            { label: 'Light', value: 'light' },
            { label: 'Match phone', value: 'system' },
          ]}
          value={preference}
          onChange={setPreference}
        />
        <T variant="small" style={{ marginTop: space.md }}>
          Dark mode is easier on the eyes in a grow room and won't light up the tent.
        </T>
      </Card>

      <SectionTitle>Units</SectionTitle>
      <Card>
        <ChipGroup
          options={[
            { label: 'Metric (litres)', value: 'metric' },
            { label: 'US (gallons)', value: 'us' },
          ]}
          value={units}
          onChange={(v) => Promise.resolve(setUnits(v)).then(rescheduleAllReminders)}
        />
        <T variant="small" style={{ marginTop: space.md }}>
          {units === 'us'
            ? 'Water in US gallons, doses shown per gallon. Amounts to measure stay in ml.'
            : 'Water in litres, doses shown per litre.'}
        </T>
      </Card>

      <SectionTitle>Grows</SectionTitle>
      <Card style={s.list}>
        <ListRow icon="albums-outline" title="Saved grows" subtitle="Open or delete grows" onPress={() => navigation.navigate('Previous Grows')} />
        <View style={s.divider} />
        <ListRow icon="trash-outline" title="Delete all data" subtitle="Removes every saved grow" danger onPress={handleDeleteAll} />
      </Card>

      <SectionTitle>CannaPlan</SectionTitle>
      <Card style={s.list}>
        <ListRow icon="information-circle-outline" title="About & links" onPress={() => navigation.navigate('About')} />
        <View style={s.divider} />
        <ListRow icon="shield-checkmark-outline" title="Privacy" subtitle="Everything stays on your phone. No accounts, no tracking." right={null} />
      </Card>

      <T variant="small" style={{ textAlign: 'center', marginTop: space.lg }}>Version {APP_VERSION}</T>
    </Screen>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    list: { paddingVertical: 2 },
    divider: { height: StyleSheet.hairlineWidth, backgroundColor: t.border },
  });
