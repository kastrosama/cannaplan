// FeedingScheduleSummary.js

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';
import * as Print from 'expo-print';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useFonts } from 'expo-font';
import { generateFeedingSchedule } from '../utils/generateFeedingSchedule';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function FeedingScheduleSummary({ navigation }) {
  const [growData, setGrowData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(null);
  const viewShotRef = useRef();

  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  useEffect(() => {
    const loadGrow = async () => {
      try {
        const saved = await AsyncStorage.getItem('grow_current');
        if (saved) {
          const data = JSON.parse(saved);
          setGrowData(data);
          const fullSchedule = generateFeedingSchedule(data);
          setSchedule(fullSchedule);

          const start = moment(data.startDate, 'YYYY-MM-DD');
          const now = moment();
          const weekIndex = now.diff(start, 'weeks');
          setCurrentWeekIndex(weekIndex);
        }
      } catch (e) {
        console.error('Failed to load grow data', e);
      }
    };
    loadGrow();
  }, []);

  const renderGrowSummary = () => {
    if (!growData) return null;

    const soilLabel =
  growData.nutrients === 'DutchPro'
    ? growData.dutchProSubtype
    : growData.nutrients === 'AdvancedNutrients'
    ? growData.advancedNutrientsSubtype
    : growData.soilType;

    const summaryItems = [
      ['STRAIN', growData.strain?.toUpperCase() || '-'],
      ['SEED BANK', growData.seedBank || '-'],
      ['TYPE', growData.type || '-'],
      ['SOIL', soilLabel || '-'],
      ['NUTRIENTS', growData.nutrients || '-'],
      ['WATER', `${growData.waterAmount || '-'} L`],
      ['START DATE', moment(growData.startDate).format('DD-MM-YYYY')],
    ];

    return (
      <View style={styles.section}>
        {summaryItems.map(([label, value], index) => (
          <View key={label} style={styles.gridRow}>
            <Text style={[styles.gridCell, styles.gridLabel, styles.borderedCell]}>{label}</Text>
            <Text style={[styles.gridCell, styles.gridValue]}>{value}</Text>
          </View>
        ))}
      </View>
    );
  };

  const handleExportAsPDF = async () => {
    try {
      const uri = await viewShotRef.current.capture();
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
    } catch (error) {
      console.error('Export failed:', error);
      Alert.alert('Error', 'Could not generate PDF.');
    }
  };

  const handleExportAsJPG = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Cannaplan', asset, false);
      Alert.alert('Saved', 'Feeding schedule saved to gallery!');
    } catch (error) {
      console.error('Error saving JPG:', error);
      Alert.alert('Error', 'Could not save image.');
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1.0 }}>
          <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
          <Text style={styles.subtitle}>Full Feeding Schedule</Text>

          {renderGrowSummary()}

          {schedule.map((week) => {
            const isFlush = week.phase === 'Flush Week';
            const isHarvest = week.phase === 'Harvest Week';

            const vegWeeks = parseInt(growData.vegWeeks || 0);
            const floweringStart = vegWeeks + 1;
            const isVegetation = week.week <= vegWeeks;
            const isFlowering = week.week >= floweringStart && week.week <= vegWeeks + 8;

            const water = parseFloat(growData.waterAmount);
            const weekIndex = week.week - 1;

            const isPast = weekIndex < currentWeekIndex;
            const isCurrent = weekIndex === currentWeekIndex;

            return (
              <View
                key={week.week}
                style={[
                  styles.weekCard,
                  isPast && styles.pastWeek,
                  isCurrent && styles.currentWeekBorder,
                ]}
              >
                <Text style={styles.weekTitle}>Week {week.week}</Text>

                {isVegetation && <Text style={styles.phaseLabel}>Vegetation Phase</Text>}
                {isFlowering && <Text style={styles.phaseLabel}>Flowering Phase</Text>}
                {isFlush && <Text style={styles.phaseLabel}>Flush Week</Text>}
                {isHarvest && <Text style={styles.phaseLabel}>Harvest Week</Text>}

                {isFlush ? (
                  <>
                    <Text style={styles.rowHeader}>Water only</Text>
                    {'pH' in week && (
                      <Text style={styles.rowHeader}>pH: {week.pH}</Text>
                    )}
                  </>
                ) : isHarvest ? null : (
                  <>
                    <View style={styles.rowHeader}>
                      <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>Nutrient</Text>
                      <Text style={[styles.cell, styles.boldLabel, styles.borderedCell]}>ml/L</Text>
                      <Text style={[styles.cell, styles.boldLabel]}>Total ml</Text>
                    </View>

                    {Object.entries(week)
                      .filter(([key]) => !['week', 'phase', 'current', 'past', 'floweringStart'].includes(key))
                      .map(([key, val]) => {
                        if (key === 'pH') {
                          return (
                            <View style={styles.row} key={key}>
                              <Text style={[styles.cell, styles.borderedCell]}>pH</Text>
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
                          <View style={styles.row} key={key}>
                            <Text style={[styles.cell, styles.borderedCell]}>{key.toUpperCase()}</Text>
                            <Text style={[styles.cell, styles.borderedCell]}>{numericVal}</Text>
                            <Text style={styles.cell}>{total}</Text>
                          </View>
                        );
                      })}
                  </>
                )}
              </View>
            );
          })}
        </ViewShot>

        <TouchableOpacity onPress={handleExportAsPDF} style={styles.fakeButton}>
          <Text style={styles.buttonText}>Print Schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleExportAsJPG} style={styles.fakeButton}>
          <Text style={styles.buttonText}>Save as JPG</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.fakeButton}>
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 20, paddingBottom: 100, backgroundColor: '#a2cb95' },
  title: {
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: 'white',
    marginBottom: 4,
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
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  gridCell: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 10,
    paddingHorizontal: 6,
    fontFamily: 'LemonMilkLight',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  gridLabel: {
    fontFamily: 'LemonMilk',
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  gridValue: {
    fontFamily: 'LemonMilkLight',
  },
  weekCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  currentWeekBorder: {
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  pastWeek: {
    opacity: 0.5,
  },
  weekTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  phaseLabel: { color: '#2e7d32', fontWeight: 'bold', marginBottom: 8 },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: 6,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
    paddingVertical: 6,
    textAlign: 'center',
  },
  borderedCell: {
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
  boldLabel: {
    fontFamily: 'LemonMilk',
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
});
