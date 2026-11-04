import React from 'react';
import { Image } from 'react-native';
import { useTheme, space } from '../theme/theme';
import { Screen, Header, T } from '../components/ui';

export default function EasterEggScreen({ navigation }) {
  const { theme } = useTheme();
  return (
    <Screen
      scroll={false}
      header={<Header title="" onBack={() => navigation.goBack()} />}
      contentStyle={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <Image source={require('../assets/leaf.png')} style={{ width: 96, height: 96, tintColor: theme.accent, marginBottom: space.lg }} />
      <T variant="title">Easter egg coming soon 🐣</T>
    </Screen>
  );
}
