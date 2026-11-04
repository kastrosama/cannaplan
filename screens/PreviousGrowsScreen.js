// PreviousGrowsScreen.js — manage all saved grows (open / delete).
import React, { useCallback, useState } from 'react';
import { View, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import { useTheme, useStyles, space } from '../theme/theme';
import { Screen, Header, Card, T, Button, PhaseBadge, EmptyState } from '../components/ui';
import { loadAllGrows, setCurrentGrow, deleteGrows } from '../utils/growStore';
import { getGrowOverview, getMediumLabel } from '../utils/growHelpers';
import { brandName } from '../utils/brands';

export default function PreviousGrowsScreen({ navigation }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const [grows, setGrows] = useState([]);
  const [selected, setSelected] = useState({});

  const load = useCallback(async () => {
    const list = await loadAllGrows();
    setGrows(list.map((g) => ({ ...g, overview: getGrowOverview(g) })));
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(() => {});
    }, [load])
  );

  const selectedKeys = Object.keys(selected).filter((k) => selected[k]);

  const open = async (g) => {
    await setCurrentGrow(g);
    navigation.navigate('Main', { screen: 'Feeding Schedule' });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete grows',
      `Permanently delete ${selectedKeys.length} grow${selectedKeys.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGrows(selectedKeys);
              setSelected({});
              await load();
            } catch {
              Alert.alert('Error', 'Could not delete the selected grows.');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen
      header={<Header title="Saved grows" subtitle={`${grows.length} saved`} onBack={() => navigation.goBack()} />}
      footer={
        selectedKeys.length ? (
          <Button title={`Delete ${selectedKeys.length} selected`} icon="trash-outline" variant="danger" onPress={confirmDelete} />
        ) : null
      }
    >
      {grows.length === 0 ? (
        <Card>
          <EmptyState title="No saved grows" message="Grows you create are saved on this phone only." />
        </Card>
      ) : null}

      {grows.map((g) => {
        const o = g.overview;
        const isSel = !!selected[g.key];
        const label =
          o.status === 'active' ? o.phaseLabel : o.status === 'upcoming' ? 'Upcoming' : 'Finished';
        const kind = o.status === 'active' ? o.current?.kind : o.status === 'upcoming' ? 'veg' : 'harvest';
        return (
          <Card key={g.key} onPress={() => open(g)} style={[s.row, isSel && { borderWidth: 1.5, borderColor: theme.danger }]}>
            <Pressable
              onPress={() => setSelected((p) => ({ ...p, [g.key]: !p[g.key] }))}
              hitSlop={12}
              style={{ marginRight: space.md }}
              accessibilityLabel="Select for deletion"
            >
              <Ionicons
                name={isSel ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSel ? theme.danger : theme.textFaint}
              />
            </Pressable>
            <View style={{ flex: 1 }}>
              <T variant="heading" numberOfLines={1}>{g.strain || 'Unnamed grow'}</T>
              <T variant="small" numberOfLines={1} style={{ marginTop: 2 }}>
                {[brandName(g.nutrients), getMediumLabel(g)].filter(Boolean).join(' · ')}
              </T>
              <T variant="small" style={{ marginTop: 2 }}>
                {[g.seedBank, `Started ${moment(g.startDate).format('D MMM YYYY')}`].filter(Boolean).join(' · ')}
              </T>
            </View>
            <PhaseBadge kind={kind} label={label} />
          </Card>
        );
      })}
    </Screen>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
  });
