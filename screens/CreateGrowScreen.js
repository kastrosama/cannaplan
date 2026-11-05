// CreateGrowScreen.js — step 2 of a new grow: plant, nutrient options, start & water.
import React, { useState } from 'react';
import { View, Image, Pressable, Platform, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import { useTheme, useStyles, space, radius, fonts } from '../theme/theme';
import { Screen, Header, Card, T, Button, ChipGroup, Field, Input, SectionTitle, BrandLogo } from '../components/ui';
import { anRecipesFor } from '../utils/charts/advancednutrients';
import { PLAGRON_LINES } from '../utils/charts/plagron';
import { makeGrowKey, parseWater, getTotalWeeks, waterInputToLitres } from '../utils/growHelpers';
import { brandById } from '../utils/brands';

const SEED_TYPES = ['Feminized', 'Regular', 'Autoflower'];
const VEG_WEEKS = [2, 3, 4, 5, 6, 7, 8].map((n) => ({ label: `${n} wk`, value: String(n) }));
const AUTO_WEEKS = [8, 9, 10, 11, 12].map((n) => ({ label: `${n} wk`, value: String(n) }));
const WATER_PRESETS = ['5', '10', '20', '50'];

const DUTCHPRO_TYPES = [
  { label: 'Soil · Hard water', value: 'Soil - Hard Water' },
  { label: 'Soil · RO / soft water', value: 'Soil - RO / Soft Water' },
  { label: 'Hydro / Coco · Hard water', value: 'Hydro / Coco - Hard Water' },
  { label: 'Hydro / Coco · RO / soft water', value: 'Hydro / Coco - RO / Soft Water' },
];
const BIOBIZZ_SOIL_OPTIONS = [
  { label: 'Light·Mix', value: 'Light-Mix' },
  { label: 'All·Mix', value: 'All-Mix' },
  { label: 'Coco·Mix', value: 'Coco' },
  { label: 'Light·Mix Peat Free', value: 'Light-Mix Peat Free' },
  { label: 'All·Mix Peat Free', value: 'All-Mix Peat Free' },
];
const YES_NO = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
];
const AN_MEDIUMS = ['Soil – Organic', 'Soil – Light Mix', 'Coco Coir', 'Hydroponics', 'Outdoor'];
const AN_LINES = {
  'Soil – Organic': ['OG Organics (Iguana Juice)', 'Sensi Terra'],
  'Soil – Light Mix': ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Connoisseur Grow/Bloom', 'pH Perfect Grow Micro Bloom', 'Sensi Terra', 'Starter Kit'],
  'Coco Coir': ['pH Perfect Sensi Coco Grow/Bloom', 'pH Perfect Connoisseur Coco Grow/Bloom', 'pH Perfect Grow Micro Bloom'],
  Hydroponics: ['pH Perfect Sensi Grow/Bloom', 'pH Perfect Connoisseur Grow/Bloom', 'pH Perfect Grow Micro Bloom', 'Starter Kit'],
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
  const { theme, units } = useTheme();
  const isUS = units === 'us';
  const s = useStyles(makeStyles);
  const brand = brandById(nutrientBrand);

  const [strain, setStrain] = useState('');
  const [seedBank, setSeedBank] = useState('');
  const [type, setType] = useState('');
  const [vegWeeks, setVegWeeks] = useState('');
  const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [waterAmount, setWaterAmount] = useState(units === 'us' ? '2' : '10');

  const [dutchProSubtype, setDutchProSubtype] = useState('');
  const [soilType, setSoilType] = useState('');
  const [bioBizzVegFeed, setBioBizzVegFeed] = useState('Fish·Mix');
  const [bioBizzMicrobes, setBioBizzMicrobes] = useState('no');
  const [bioBizzSoftWater, setBioBizzSoftWater] = useState('no');
  const [anMedium, setAnMedium] = useState('');
  const [anLine, setAnLine] = useState('');
  const [anRecipe, setAnRecipe] = useState('Top Shelf');
  const [cannaMedium, setCannaMedium] = useState('');
  const [ghLine, setGhLine] = useState('');
  const [ghIntensity, setGhIntensity] = useState('');
  const [ghEnvironment, setGhEnvironment] = useState('');
  const [ghMedium, setGhMedium] = useState('');

  const [plagronLine, setPlagronLine] = useState('');

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
    [nutrientBrand === 'Plagron' && !plagronLine, 'Plagron line'],
    [isNaN(waterInputToLitres(waterAmount, units)), 'water amount'],
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
      ...(nutrientBrand === 'BioBizz'
        ? {
            bioBizzVegFeed,
            bioBizzMicrobes: bioBizzMicrobes === 'yes',
            bioBizzSoftWater: bioBizzSoftWater === 'yes',
          }
        : {}),
      advancedNutrientsSubtype: anMedium,
      advancedNutrientsLine: anLine,
      ...(anRecipesFor(anLine).length > 1 ? { advancedNutrientsRecipe: anRecipe } : {}),
      cannaMedium,
      generalHydroponicsLine: ghLine,
      generalHydroponicsIntensity: ghIntensity,
      generalHydroponicsEnvironment: ghEnvironment,
      generalHydroponicsMedium: ghMedium,
      plagronLine,
      waterAmount: String(waterInputToLitres(waterAmount, units)), // always stored in litres
    };

    try {
      const key = makeGrowKey(data.strain, startDate);
      await AsyncStorage.setItem(key, JSON.stringify(data));
      await AsyncStorage.setItem('grow_current', JSON.stringify({ key, ...data }));
      navigation.navigate('Main', { screen: 'Feeding Schedule', params: { refresh: Date.now() } });
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
            <BrandLogo brand={brand} />
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
            <ChipGroup options={BIOBIZZ_SOIL_OPTIONS} value={soilType} onChange={setSoilType} />
          </Field>
        )}
        {nutrientBrand === 'BioBizz' && (
          <Field label="Veg feed" hint="They do the same job, so use one. Flowering always uses Bio·Grow.">
            <ChipGroup options={['Fish·Mix', 'Bio·Grow']} value={bioBizzVegFeed} onChange={setBioBizzVegFeed} />
          </Field>
        )}
        {nutrientBrand === 'BioBizz' && (
          <Field label="Do you use BioBizz Microbes?" hint="Optional. Applied once a week.">
            <ChipGroup options={YES_NO} value={bioBizzMicrobes} onChange={setBioBizzMicrobes} />
          </Field>
        )}
        {nutrientBrand === 'BioBizz' && (
          <Field label="Soft or RO water?" hint="BioBizz recommends adding CalMag with soft or RO water.">
            <ChipGroup options={YES_NO} value={bioBizzSoftWater} onChange={setBioBizzSoftWater} />
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
            {anRecipesFor(anLine).length > 1 ? (
              <Field label="Recipe" hint="Top Shelf: base + core boosters. Master: adds the full additive range.">
                <ChipGroup options={anRecipesFor(anLine)} value={anRecipe} onChange={setAnRecipe} />
              </Field>
            ) : null}
          </>
        )}

        {nutrientBrand === 'CANNA' && (
          <Field label="Growing medium">
            <ChipGroup options={CANNA_MEDIUMS} value={cannaMedium} onChange={setCannaMedium} />
          </Field>
        )}

        {nutrientBrand === 'Plagron' && (
          <Field
            label="Line & medium"
            hint={
              plagronLine.includes('Grow-Mix') || plagronLine.includes('All-Mix')
                ? 'Pre-fertilised soil: the base feed starts later because the soil already feeds the plant.'
                : 'Pick the line that matches your bottles and the soil or medium you use.'
            }
          >
            <ChipGroup
              options={Object.keys(PLAGRON_LINES).map((k) => ({ label: k, value: k }))}
              value={plagronLine}
              onChange={setPlagronLine}
            />
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

        <Field label={`Water per feed (${isUS ? 'US gallons' : 'litres'})`} hint="Doses are worked out for this amount. You can change it later on the weekly screen.">
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <ChipGroup
                options={(isUS ? ['1', '2', '5', '10'] : WATER_PRESETS).map((w) => ({ label: `${w} ${isUS ? 'gal' : 'L'}`, value: w }))}
                value={waterAmount}
                onChange={setWaterAmount}
              />
            </View>
          </View>
          <Input
            value={waterAmount}
            onChangeText={setWaterAmount}
            keyboardType="decimal-pad"
            placeholder={isUS ? 'Other amount, e.g. 3.5' : 'Other amount, e.g. 7,5'}
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
