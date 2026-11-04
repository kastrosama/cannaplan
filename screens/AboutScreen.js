// AboutScreen.js
import React from 'react';
import { View, Image, Linking, StyleSheet } from 'react-native';

import { useTheme, useStyles, space } from '../theme/theme';
import { Screen, Header, Card, T, SectionTitle, ListRow } from '../components/ui';

const COMMUNITY = [
  { icon: 'mail-outline', title: 'Email', subtitle: 'cannaplan.app@gmail.com', url: 'mailto:cannaplan.app@gmail.com' },
  { icon: 'logo-reddit', title: 'Reddit', subtitle: 'r/cannaplan', url: 'https://www.reddit.com/r/cannaplan/' },
  { icon: 'logo-instagram', title: 'Instagram', subtitle: '@cannaplanapp', url: 'https://www.instagram.com/cannaplanapp/' },
];

const BRAND_LINKS = [
  ['BioBizz', 'https://www.biobizz.com/'],
  ['Dutch Pro', 'https://dutchpro.com/'],
  ['Advanced Nutrients', 'https://www.advancednutrients.com/'],
  ['CANNA', 'https://www.canna.com/'],
  ['General Hydroponics', 'https://generalhydroponics.com/'],
  ['Plagron', 'https://plagron.com/'],
];

const open = (url) => Linking.openURL(url).catch(() => {});

export default function AboutScreen({ navigation }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);

  return (
    <Screen header={<Header title="About" onBack={() => navigation.goBack()} />}>
      <Card style={{ alignItems: 'center', paddingVertical: space.xl }}>
        <Image source={require('../assets/leaf.png')} style={{ width: 64, height: 64, tintColor: theme.accent, marginBottom: space.md }} />
        <T variant="title" style={{ textAlign: 'center' }}>Feeding schedules, made simple</T>
        <T variant="muted" style={{ textAlign: 'center', marginTop: space.sm }}>
          CannaPlan turns confusing nutrient charts into exactly what to mix each week, in the right order, for the amount of water you use.
        </T>
      </Card>

      <Card>
        <T variant="body">
          It works completely offline. There are no accounts, no data collection and no tracking. Everything stays on your phone unless you choose to export it.
        </T>
        <T variant="body" style={{ marginTop: space.md }}>
          A personal project built by growers, for growers. 100% free, no ads.
        </T>
      </Card>

      <SectionTitle>Community</SectionTitle>
      <Card style={{ paddingVertical: 2 }}>
        {COMMUNITY.map((l, i) => (
          <View key={l.title} style={i > 0 && s.divider}>
            <ListRow icon={l.icon} title={l.title} subtitle={l.subtitle} onPress={() => open(l.url)} right={null} />
          </View>
        ))}
      </Card>

      <SectionTitle>Nutrient brands</SectionTitle>
      <Card style={{ paddingVertical: 2 }}>
        {BRAND_LINKS.map(([name, url], i) => (
          <View key={name} style={i > 0 && s.divider}>
            <ListRow icon="open-outline" title={name} subtitle="Official site" onPress={() => open(url)} right={null} />
          </View>
        ))}
      </Card>

      <T variant="small" style={{ textAlign: 'center', marginTop: space.md }}>
        Always check the manufacturer's label. CannaPlan is a planning aid, not a replacement for it.
      </T>
    </Screen>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    divider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: t.border },
  });
