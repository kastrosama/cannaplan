// CurrentWeekSchedule.js

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import ViewShot from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Print from 'expo-print';
import { useFonts } from 'expo-font';
import { generateFeedingSchedule } from '../utils/generateFeedingSchedule';

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

        const start = moment(grow.startDate);
        const now = moment();
        const weekNumber = Math.floor(moment.duration(now.diff(start)).asDays() / 7) + 1;
        setCurrentWeek(weekNumber);
        setDaysSinceStart(Math.floor(moment.duration(now.diff(start)).asDays()) + 1);

        const startOfWeek = start.clone().add(weekNumber - 1, 'weeks');
        const endOfWeek = startOfWeek.clone().add(6, 'days');
        setWeekRange(`${startOfWeek.format('DD MMM')} – ${endOfWeek.format('DD MMM')}`);

        const schedule = generateFeedingSchedule(grow);
        const week = schedule.find(w => w.week === weekNumber);
        setWeekData(week);

        const vegWeeks = parseInt(grow.vegWeeks);
        const flowerStart = vegWeeks + 1;
        const flushWeek = vegWeeks + 9;
        const harvestWeek = vegWeeks + 10;

        if (weekNumber <= vegWeeks) {
          setPhaseInfo(`Vegetation Week ${weekNumber} of ${vegWeeks}`);
          setLightCycle('24/0');
        } else if (weekNumber >= flowerStart && weekNumber <= vegWeeks + 8) {
          const flowerWeek = weekNumber - vegWeeks;
          setPhaseInfo(`Flowering Week ${flowerWeek} of 8`);
          setLightCycle('12/12');
        } else if (weekNumber === flushWeek) {
          setPhaseInfo('Flush Week');
          setLightCycle('12/12');
        } else if (weekNumber === harvestWeek) {
          setPhaseInfo('Harvest Week');
          setLightCycle('-');
        } else {
          setPhaseInfo('Schedule Complete');
          setLightCycle('-');
        }
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

        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status === 'granted') {
          await MediaLibrary.saveToLibraryAsync(fileUri);
        }

        Alert.alert('Exported!', `Saved to device as ${filename}`);
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
        : growData.soilType;

    const totalWeeks = parseInt(growData.vegWeeks) + 8 + 2;

    const summaryItems = [
      ['STRAIN', growData.strain?.toUpperCase() || '-'],
      ['SEED BANK', growData.seedBank || '-'],
      ['TYPE', growData.type || '-'],
      ['SOIL', soilLabel],
      ['NUTRIENTS', growData.nutrients || '-'],
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

    const water = parseFloat(growData.waterAmount);
    const phase = weekData.phase;

    return (
      <View style={styles.section}>
        <View style={styles.rowHeader}>
          <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>NUTRIENT</Text>
          <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>ML/L</Text>
          <Text style={[styles.cell, styles.boldLabel]}>TOTAL ML</Text>
        </View>

        {phase === 'Flush Week' && (
          <>
            <View style={styles.rowWithBorders}>
              <Text style={[styles.cell, styles.borderedCell]}>Water</Text>
              <Text style={[styles.cell, styles.borderedCell]}>—</Text>
              <Text style={styles.cell}>—</Text>
            </View>
            {'pH' in weekData && (
              <View style={styles.rowWithBorders}>
                <Text style={[styles.cell, styles.borderedCell]}>pH</Text>
                <Text style={[styles.cell, styles.borderedCell]}>{weekData.pH}</Text>
                <Text style={styles.cell}>—</Text>
              </View>
            )}
          </>
        )}

        {phase === 'Harvest Week' && (
          <View style={styles.rowWithBorders}>
            <Text style={[styles.cell, styles.borderedCell]}>HARVEST</Text>
            <Text style={[styles.cell, styles.borderedCell]}>—</Text>
            <Text style={styles.cell}>—</Text>
          </View>
        )}

        {!phase && Object.entries(weekData)
          .filter(([key]) => !['week', 'phase'].includes(key.toLowerCase()))
          .map(([key, val]) => {
            if (key === 'pH') {
              return (
                <View style={styles.rowWithBorders} key={key}>
                  <Text style={[styles.cell, styles.borderedCell]}>{key.toUpperCase()}</Text>
                  <Text style={[styles.cell, styles.borderedCell]}>{val}</Text>
                  <Text style={styles.cell}>—</Text>
                </View>
              );
            }

            const numericVal = parseFloat(val);
            const total = !isNaN(numericVal) && !isNaN(water)
              ? (numericVal * water).toFixed(1)
              : 'N/A';

            return (
              <View style={styles.rowWithBorders} key={key}>
                <Text style={[styles.cell, styles.borderedCell]}>{key.toUpperCase()}</Text>
                <Text style={[styles.cell, styles.borderedCell]}>{numericVal}</Text>
                <Text style={styles.cell}>{total}</Text>
              </View>
            );
          })}
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
