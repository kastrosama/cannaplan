// CurrentWeekSchedule.js

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library/legacy';
import * as Print from 'expo-print';
import { useFonts } from 'expo-font';
import {
  getSchedule,
  getTotalWeeks,
  getWeekNumber,
  getDayNumber,
  getWeekRange,
  getPhaseInfo,
  getWeekRows,
  parseWater,
} from '../utils/growHelpers';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function CurrentWeekSchedule({ navigation }) {
  const viewShotRef = useRef();
  const scrollViewRef = useRef();

  const [growData, setGrowData] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [weekData, setWeekData] = useState(null);
  const [weekRange, setWeekRange] = useState('');
  const [daysSinceStart, setDaysSinceStart] = useState(null);
  const [phaseInfo, setPhaseInfo] = useState('');
  const [lightCycle, setLightCycle] = useState('');

  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stored = await AsyncStorage.getItem('grow_current');
        if (!stored) return;

        const grow = JSON.parse(stored);
        setGrowData(grow);

        const weekNumber = getWeekNumber(grow.startDate);
        setCurrentWeek(weekNumber);
        setDaysSinceStart(getDayNumber(grow.startDate));
        setWeekRange(getWeekRange(grow.startDate, Math.max(weekNumber, 1)));

        const schedule = getSchedule(grow);
        setWeekData(schedule.find((w) => w.week === weekNumber) || null);

        const info = getPhaseInfo(grow, schedule, weekNumber);
        setPhaseInfo(info.label);
        setLightCycle(info.light);
      } catch (err) {
        console.error('Failed to load grow data or generate schedule', err);
      }
    };

    fetchData();
  }, []);

  const exportAsImage = async (format = 'jpg') => {
    if (!growData) {
      Alert.alert('Grow Not Loaded', 'No grow data available to export.');
      return;
    }

    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const uri = await viewShotRef.current.capture();

      if (format === 'jpg') {
        const filename = `current_week_${growData.strain?.split(' ')[0]}_${moment(growData.startDate).format('YYYY-MM-DD')}.jpg`;
        const fileUri = FileSystem.documentDirectory + filename;
        await FileSystem.copyAsync({ from: uri, to: fileUri });

        const { status } = await MediaLibrary.requestPermissionsAsync(true);
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Allow photo access to save the schedule to your gallery.');
          return;
        }
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('Exported!', `Saved to your gallery as ${filename}`);
      } else if (format === 'pdf') {
        const imageBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const html = `
          <html>
            <body style="margin:0;padding:0;">
              <img src="data:image/jpeg;base64,${imageBase64}" style="width:50%;display:block;margin:0 auto;" />
            </body>
          </html>
        `;

        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (!fontsLoaded) return null;

  const renderSummary = () => {
    if (!growData) return null;

    const soilLabel =
      growData.nutrients === 'DutchPro'
        ? growData.dutchProSubtype
        : growData.nutrients === 'AdvancedNutrients'
        ? growData.advancedNutrientsSubtype
        : growData.nutrients === 'CANNA'
        ? growData.cannaMedium
        : growData.nutrients === 'GeneralHydroponics'
        ? growData.generalHydroponicsMedium
        : growData.soilType;

    const nutrientDisplay = growData.nutrients === 'GeneralHydroponics' ? 'General Hydro' : growData.nutrients;

    const totalWeeks = getTotalWeeks(growData);

    const summaryItems = [
      ['STRAIN', growData.strain?.toUpperCase() || '-'],
      ['SEED BANK', growData.seedBank || '-'],
      ['TYPE', growData.type || '-'],
      ['MEDIUM', soilLabel],
      ['NUTRIENTS', nutrientDisplay || '-'],
      ...(growData.nutrients === 'GeneralHydroponics' && growData.generalHydroponicsLine ? 
        [['NUTRIENT LINE', growData.generalHydroponicsLine]] : []),
      ['WATER', `${growData.waterAmount || '-'} L`],
      ['START DATE', moment(growData.startDate).format('DD-MM-YYYY')],
      ['DAYS SINCE START', daysSinceStart],
      ['THIS WEEK', weekRange],
      ['CURRENT PHASE', phaseInfo],
      ['LIGHT CYCLE', lightCycle],
      ['TOTAL GROW DURATION', `${totalWeeks} weeks`],
    ];

    return (
      <View style={styles.section}>
        <View style={styles.rowHeader}>
          <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>INFO</Text>
          <Text style={[styles.cell, styles.boldLabel]}>VALUE</Text>
        </View>
        {summaryItems.map(([label, value]) => (
          <View style={styles.rowWithBorders} key={label}>
            <Text style={[styles.cell, styles.borderedCell]}>{label}</Text>
            <Text style={styles.cell}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderWeekNutrients = () => {
    if (!weekData || !growData) {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionText}>No schedule found for this week.</Text>
        </View>
      );
    }

    const water = parseWater(growData.waterAmount);
    const { kind } = weekData;
    const rows = getWeekRows(weekData, water);

    return (
      <View style={styles.section}>
        {weekData.stage ? <Text style={styles.sectionText}>Stage: {weekData.stage}</Text> : null}

        <View style={styles.rowHeader}>
          <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>NUTRIENT</Text>
          <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>PER L</Text>
          <Text style={[styles.cell, styles.boldLabel]}>TOTAL</Text>
        </View>

        {kind === 'flush' && (
          <View style={styles.rowWithBorders}>
            <Text style={[styles.cell, styles.borderedCell]}>Water only</Text>
            <Text style={[styles.cell, styles.borderedCell]}>—</Text>
            <Text style={styles.cell}>—</Text>
          </View>
        )}

        {kind === 'harvest' && (
          <View style={styles.rowWithBorders}>
            <Text style={[styles.cell, styles.borderedCell]}>HARVEST</Text>
            <Text style={[styles.cell, styles.borderedCell]}>—</Text>
            <Text style={styles.cell}>—</Text>
          </View>
        )}

        {rows
          .filter((r) => kind !== 'flush' || r.reading)
          .map((r) => (
            <View style={styles.rowWithBorders} key={r.key}>
              <Text style={[styles.cell, styles.borderedCell, !r.reading && { fontSize: 10 }]}>{r.label}</Text>
              <Text style={[styles.cell, styles.borderedCell]}>{r.perL}</Text>
              <Text style={styles.cell}>{r.total}</Text>
            </View>
          ))}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#a2cb95' }}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={{ paddingBottom: 40 }}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1.0 }} style={styles.container}>
          <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
          <Text style={styles.subtitle}>Weekly Schedule – Week {currentWeek ?? '--'}</Text>
          <Text style={styles.subtitle}>Day {daysSinceStart ?? '--'}</Text>

          {renderSummary()}
          {renderWeekNutrients()}
        </ViewShot>

        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('FeedingScheduleSummary')}>
            <Text style={styles.buttonText}>View Full Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fakeButton} onPress={() => exportAsImage('pdf')}>
            <Text style={styles.buttonText}>Print Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fakeButton} onPress={() => exportAsImage('jpg')}>
            <Text style={styles.buttonText}>Export as JPG</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('Home')}>
            <Text style={styles.buttonText}>Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a2cb95',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: 'white',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'LemonMilkLight',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
  },
  sectionText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
    marginBottom: 6,
  },
  fakeButton: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
  boldLabel: {
    fontFamily: 'LemonMilk',
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 6,
    marginBottom: 8,
    alignItems: 'center',
  },
  rowWithBorders: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 0,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  borderedCell: {
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});