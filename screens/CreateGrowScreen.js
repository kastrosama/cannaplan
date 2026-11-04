// CreateGrowScreen.js — step 2 of a new grow: plant, nutrient options, start & water.
import React, { useState } from 'react';
import { View, Image, Pressable, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import { useTheme, useStyles, space, radius, fonts } from '../theme/theme';
import { Screen, Header, Card, T, Button, ChipGroup, Field, Input, SectionTitle } from '../components/ui';
import { makeGrowKey, parseWater, getTotalWeeks } from '../utils/growHelpers';
import { brandById } from '../utils/brands';

const SEED_TYPES = ['Feminized', 'Regular', 'Autoflower'];
const VEG_WEEKS = [2, 3, 4, 5, 6, 7, 8].map((n) => ({ label: `${n} wk`, value: String(n) }));
const AUTO_WEEKS = [8, 9, 10, 11, 12].map((n) => ({ label: `${n} wk`, value: String(n) }));
const WATER_PRESETS = ['5', '10', '20', '50'];

const DUTCHPRO_TYPES = [
  'All-Mix - Hard Water',
  'All-Mix - RO / Soft Water',
  'Light-Mix - Hard Water',
  'Light-Mix - RO / Soft Water',
  'Hydro / Coco - Hard Water',
  'Hydro / Coco - RO / Soft Water',
];
const BIOBIZZ_SOILS = ['Light-Mix', 'All-Mix', 'Coco'];
const AN_MEDIUMS = ['Soil – Organic', 'Soil – Light Mix', 'Coco Coir', 'Hydroponics', 'Outdoor'];
const AN_LINES = {
  'Soil – Organic': ['OG Organics (Iguana Juice)'],
  'Soil – Light Mix': ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
  'Coco Coir': ['pH Perfect Sensi Coco Grow/Bloom', 'pH Perfect Connoisseur Coco Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
  Hydroponics: ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Connoisseur Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
  Outdoor: ['Jungle Juice'],
};
const CANNA_MEDIUMS = [
  { label: 'Terra (soil)', value: 'Terra' },
  { label: 'Coco', value: 'Coco' },
  { label: 'Aqua (recirculating)', value: 'Aqua' },
  { label: 'Hydro (run-to-waste)', value: 'Hydro' },
];
const GH_LINES = [
  { label: 'Flora Series (3-part)', value: 'Flora Series' },
  { label: 'MaxiSeries (powder)', value: 'MaxiSeries' },
  { label: 'BioThrive (organic)', value: 'Organics (BioThrive)' },
  { label: 'FloraNova (1-part)', value: 'FloraNova' },
];
const GH_MEDIUMS = {
  'Flora Series': ['Soil', 'Coco Coir', 'Deep Water Culture (DWC)', 'Ebb & Flow', 'NFT (Nutrient Film Technique)', 'Aeroponics'],
  MaxiSeries: ['Soil', 'Coco Coir', 'Deep Water Culture (DWC)', 'Ebb & Flow'],
  'Organics (BioThrive)': ['Soil', 'Coco Coir'],
  FloraNova: ['Soil', 'Coco Coir', 'Deep Water Culture (DWC)', 'Ebb & Flow', 'NFT (Nutrient Film Technique)', 'Aeroponics'],
};
const INTENSITIES = [
  { label: 'Light', value: 'Light' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Aggressive', value: 'Aggressive' },
];

export default function CreateGrowScreen({ navigation, nutrientBrand }) {
  const { theme } = useTheme();
  const s = useStyles(makeStyles);
  const brand = brandById(nutrientBrand);

  const [strain, setStrain] = useState('');
  const [seedBank, setSeedBank] = useState('');
  const [type, setType] = useState('');
  const [vegWeeks, setVegWeeks] = useState('');
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [waterAmount, setWaterAmount] = useState('10');

  const [dutchProSubtype, setDutchProSubtype] = useState('');
  const [soilType, setSoilType] = useState('');
  const [anMedium, setAnMedium] = useState('');
  const [anLine, setAnLine] = useState('');
  const [cannaMedium, setCannaMedium] = useState('');
  const [ghLine, setGhLine] = useState('');
  const [ghIntensity, setGhIntensity] = useState('');
  const [ghEnvironment, setGhEnvironment] = useState('');
  const [ghMedium, setGhMedium] = useState('');

  const [missing, setMissing] = useState([]);

  const isAuto = type === 'Autoflower';
  const setTypeAndReset = (v) => {
    if ((v === 'Autoflower') !== isAuto) setVegWeeks('');
    setType(v);
  };

  const checks = [
    [!strain.trim(), 'strain name'],
    [!type, 'seed type'],
    [!vegWeeks, isAuto ? 'total duration' : 'veg duration'],
    [nutrientBrand === 'DutchPro' && !dutchProSubtype, 'Dutch Pro type'],
    [nutrientBrand === 'BioBizz' && !soilType, 'soil type'],
    [nutrientBrand === 'AdvancedNutrients' && !anMedium, 'growing medium'],
    [nutrientBrand === 'AdvancedNutrients' && !anLine, 'nutrient line'],
    [nutrientBrand === 'CANNA' && !cannaMedium, 'growing medium'],
    [nutrientBrand === 'GeneralHydroponics' && !ghLine, 'nutrient line'],
    [nutrientBrand === 'GeneralHydroponics' && ghLine === 'MaxiSeries' && !ghEnvironment, 'environment'],
    [nutrientBrand === 'GeneralHydroponics' && !!ghLine && !ghIntensity, 'feeding intensity'],
    [nutrientBrand === 'GeneralHydroponics' && !ghMedium, 'growing medium'],
    [isNaN(parseWater(waterAmount)), 'water amount'],
  ];

  const handleSave = async () => {
    const miss = checks.filter(([bad]) => bad).map(([, name]) => name);
    setMissing(miss);
    if (miss.length) return;

    const data = {
      strain: strain.trim(),
      seedBank: seedBank.trim(),
      type,
      vegWeeks,
      startDate,
      nutrients: nutrientBrand,
      dutchProSubtype,
      soilType,
      advancedNutrientsSubtype: anMedium,
      advancedNutrientsLine: anLine,
      cannaMedium,
      generalHydroponicsLine: ghLine,
      generalHydroponicsIntensity: ghIntensity,
      generalHydroponicsEnvironment: ghEnvironment,
      generalHydroponicsMedium: ghMedium,
      waterAmount: String(parseWater(waterAmount)),
    };

    try {
      await AsyncStorage.setItem('grow_current', JSON.stringify(data));
      await AsyncStorage.setItem(makeGrowKey(data.strain, startDate), JSON.stringify(data));
      navigation.navigate('Main', { screen: 'Feeding Schedule' });
    } catch (e) {
      console.error('Failed to save grow data', e);
      setMissing(['(could not save, please try again)']);
    }
  };

  const totalWeeks = vegWeeks ? getTotalWeeks({ type, vegWeeks }) : null;

  return (
    <Screen
      header={<Header title={brand?.name || 'New grow'} subtitle="Step 2 of 2 · Grow details" onBack={() => navigation.goBack()} right={
        brand ? (
          <View style={s.logoTile}>
            <Image source={brand.logo} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
          </View>
        ) : null
      } />}
      footer={
        <>
          {missing.length ? (
            <View style={s.missing}>
              <Ionicons name="alert-circle" size={16} color={theme.danger} style={{ marginRight: 8 }} />
              <T variant="small" color={theme.danger} style={{ flex: 1 }}>
                Still needed: {missing.join(', ')}
              </T>
            </View>
          ) : null}
          <Button title="Create grow plan" icon="checkmark" onPress={handleSave} />
        </>
      }
    >
      <SectionTitle>Your plant</SectionTitle>
      <Card>
        <Field label="Strain">
          <Input value={strain} onChangeText={setStrain} placeholder="e.g. Runtz" autoCapitalize="words" />
        </Field>
        <Field label="Seed bank" hint="Optional">
          <Input value={seedBank} onChangeText={setSeedBank} placeholder="e.g. Ritual Genetics" autoCapitalize="words" />
        </Field>
        <Field label="Seed type">
          <ChipGroup options={SEED_TYPES} value={type} onChange={setTypeAndReset} />
        </Field>
        {type ? (
          <Field
            label={isAuto ? 'Total grow time' : 'Vegetative time'}
            hint={totalWeeks ? (isAuto ? `${totalWeeks} weeks seed to harvest` : `${vegWeeks} wk veg + 8 wk flower + flush + harvest = ${totalWeeks} weeks`) : undefined}
          >
            <ChipGroup options={isAuto ? AUTO_WEEKS : VEG_WEEKS} value={vegWeeks} onChange={setVegWeeks} />
          </Field>
        ) : null}
      </Card>

      <SectionTitle>Nutrient setup</SectionTitle>
      <Card>
        {nutrientBrand === 'BioBizz' && (
          <Field label="Soil type">
            <ChipGroup options={BIOBIZZ_SOILS} value={soilType} onChange={setSoilType} />
          </Field>
        )}

        {nutrientBrand === 'DutchPro' && (
          <Field label="Medium & water">
            <ChipGroup options={DUTCHPRO_TYPES} value={dutchProSubtype} onChange={setDutchProSubtype} />
          </Field>
        )}

        {nutrientBrand === 'AdvancedNutrients' && (
          <>
            <Field label="Growing medium">
              <ChipGroup options={AN_MEDIUMS} value={anMedium} onChange={(v) => { setAnMedium(v); setAnLine(''); }} />
            </Field>
            {anMedium ? (
              <Field label="Nutrient line">
                <ChipGroup options={AN_LINES[anMedium]} value={anLine} onChange={setAnLine} />
              </Field>
            ) : null}
          </>
        )}

        {nutrientBrand === 'CANNA' && (
          <Field label="Growing medium">
            <ChipGroup options={CANNA_MEDIUMS} value={cannaMedium} onChange={setCannaMedium} />
          </Field>
        )}

        {nutrientBrand === 'GeneralHydroponics' && (
          <>
            <Field label="Nutrient line">
              <ChipGroup
                options={GH_LINES}
                value={ghLine}
                onChange={(v) => { setGhLine(v); setGhIntensity(''); setGhEnvironment(''); setGhMedium(''); }}
              />
            </Field>
            {ghLine === 'MaxiSeries' ? (
              <Field label="Environment">
                <ChipGroup
                  options={[{ label: 'Indoor', value: 'Indoor' }, { label: 'Outdoor', value: 'Outdoor' }]}
                  value={ghEnvironment}
                  onChange={setGhEnvironment}
                />
              </Field>
            ) : null}
            {ghLine && (ghLine !== 'MaxiSeries' || ghEnvironment) ? (
              <Field label="Feeding intensity" hint="Start with Light or Medium if you're unsure">
                <ChipGroup options={INTENSITIES} value={ghIntensity} onChange={setGhIntensity} />
              </Field>
            ) : null}
            {ghLine && ghIntensity ? (
              <Field label="Growing medium">
                <ChipGroup options={GH_MEDIUMS[ghLine]} value={ghMedium} onChange={setGhMedium} />
              </Field>
            ) : null}
          </>
        )}
      </Card>

      <SectionTitle>Start & water</SectionTitle>
      <Card>
        <Field label="Start date">
          <Pressable onPress={() => setShowDatePicker(true)} style={s.dateButton}>
            <Ionicons name="calendar-outline" size={18} color={theme.textMuted} style={{ marginRight: 10 }} />
            <T variant="body" style={{ flex: 1 }} numberOfLines={1}>{moment(startDate).format('ddd, D MMM YYYY')}</T>
            <T variant="small" color={theme.accent} style={{ marginLeft: space.md }}>Change</T>
          </Pressable>
        </Field>
        {showDatePicker && (
          <DateTimePicker
            value={moment(startDate).toDate()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selected) => {
              setShowDatePicker(false);
              if (event.type === 'set' && selected) setStartDate(moment(selected).format('YYYY-MM-DD'));
            }}
          />
        )}

        <Field label="Water per feed (litres)" hint="Doses are worked out for this amount. You can change it later on the weekly screen.">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <ChipGroup
                options={WATER_PRESETS.map((w) => ({ label: `${w} L`, value: w }))}
                value={waterAmount}
                onChange={setWaterAmount}
              />
            </View>
          </View>
          <Input
            value={waterAmount}
            onChangeText={setWaterAmount}
            keyboardType="decimal-pad"
            placeholder="Other amount, e.g. 7,5"
            style={{ marginTop: space.sm }}
          />
        </Field>
      </Card>
    </Screen>
  );
}

const makeStyles = (t) =>
  StyleSheet.create({
    logoTile: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: t.logoTile,
      padding: 4,
      marginLeft: space.md,
    },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: t.surfaceAlt,
      borderRadius: radius.md,
      paddingHorizontal: space.lg,
      paddingVertical: 13,
    },
    missing: { flexDirection: 'row', alignItems: 'center', marginBottom: space.md },
  });
