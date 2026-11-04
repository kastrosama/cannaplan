// SelectNutrientsScreen.js — step 1 of a new grow: pick the nutrient brand.
import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme, useStyles, space, radius } from '../theme/theme';
import { Screen, Header, Card, T } from '../components/ui';
import { BRANDS } from '../utils/brands';

export default function SelectNutrientsScreen({ navigation }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);

  return (
    <Screen header={<Header title="New grow" subtitle="Step 1 of 2 · Choose your nutrients" />}>
      {BRANDS.map((b) => (
        <Card key={b.id} onPress={() => navigation.navigate(b.route)} style={s.row}>
          <View style={s.logoTile}>
            <Image source={b.logo} style={s.logo} resizeMode="contain" />
          </View>
          <View style={{ flex: 1 }}>
            <T variant="heading">{b.name}</T>
            <T variant="small" style={{ marginTop: 3 }}>{b.tagline}</T>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textFaint} />
        </Card>
      ))}

      <View style={s.soon}>
        <Ionicons name="sparkles-outline" size={16} color={theme.textMuted} style={{ marginRight: 8 }} />
        <T variant="muted">More brands coming soon</T>
      </View>
    </Screen>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
    logoTile: {
      width: 56,
      height: 56,
      borderRadius: radius.md,
      backgroundColor: t.logoTile,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 6,
      marginRight: space.lg,
    },
    logo: { width: '100%', height: '100%' },
    soon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: space.md },
  });
