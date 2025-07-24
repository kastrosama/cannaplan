import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Checkbox from 'expo-checkbox';
import moment from 'moment';
import { useFonts } from 'expo-font';

export default function PreviousGrowsScreen({ navigation }) {
  const [savedGrows, setSavedGrows] = useState([]);
  const [selected, setSelected] = useState({});
  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  useEffect(() => {
    loadSavedGrows();
  }, []);

  const loadSavedGrows = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const growKeys = keys.filter(key => key.startsWith('grow_') && key !== 'grow_current');

      const grows = await Promise.all(
        growKeys.map(async (key) => {
          const item = await AsyncStorage.getItem(key);
          const data = JSON.parse(item);
          return {
            key,
            strain: data.strain || 'Unknown',
            seedBank: data.seedBank || 'Unknown',
            soilType: data.soilType || data.dutchProSubtype || 'Unknown',
            nutrients: data.nutrients || 'Unknown',
            startDate: data.startDate || '',
            sortDate: new Date(data.startDate),
          };
        })
      );

      grows.sort((a, b) => b.sortDate - a.sortDate);
      setSavedGrows(grows);
      return grows;
    } catch (e) {
      console.error('Failed to load saved grows:', e);
      return [];
    }
  };

  const handleLoadGrow = async (key) => {
    try {
      const grow = await AsyncStorage.getItem(key);
      if (grow) {
        await AsyncStorage.setItem('grow_current', grow);
        navigation.navigate('Feeding Schedule');
      } else {
        Alert.alert('Error', 'No grow found for this key.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load grow.');
      console.error('handleLoadGrow error:', e);
    }
  };

  const toggleSelection = (key) => {
    setSelected((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const deleteSelectedGrows = async () => {
    const keysToDelete = Object.keys(selected).filter(key => selected[key]);
    if (keysToDelete.length === 0) {
      Alert.alert('No selection', 'Please select at least one grow to delete.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to permanently delete ${keysToDelete.length} grow(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await Promise.all(keysToDelete.map(key => AsyncStorage.removeItem(key)));
              setSelected({});
              const updated = await loadSavedGrows();
              setSavedGrows(updated);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete selected grows.');
            }
          },
        },
      ]
    );
  };

  const renderGrowItem = ({ item }) => (
    <View style={styles.growCard}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => handleLoadGrow(item.key)}>
        <Text style={styles.cardTitle}>{item.strain}</Text>
        <Text style={styles.cardDetail}>Seed Bank: {item.seedBank}</Text>
        <Text style={styles.cardDetail}>Nutrients: {item.nutrients}</Text>
        <Text style={styles.cardDetail}>Soil: {item.soilType}</Text>
        <Text style={styles.cardDetail}>Started: {moment(item.startDate).format('DD MMM YYYY')}</Text>
      </TouchableOpacity>
      <Checkbox
        value={selected[item.key] || false}
        onValueChange={() => toggleSelection(item.key)}
        style={styles.checkbox}
      />
    </View>
  );

  const hasSelection = Object.values(selected).some(val => val);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingTop: 50, paddingBottom: 20 }}>
        <Text style={styles.title}>CANNAPLAN</Text>
        <Text style={styles.subtitle}>Saved Grows</Text>
        <View style={{ height: 20 }} />
      </View>

      <FlatList
        data={savedGrows}
        keyExtractor={(item) => item.key}
        renderItem={renderGrowItem}
        contentContainerStyle={{ paddingBottom: 120 }}
      />

      {hasSelection && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={deleteSelectedGrows}
        >
          <Text style={styles.buttonText}>Delete Selected</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={() => navigation.navigate('Home')}
        style={styles.fullWidthButton}
      >
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#a2cb95', paddingHorizontal: 20 },
  title: {
    fontSize: Math.min(Math.round(Dimensions.get('window').width * 0.11), 42),
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'LemonMilkLight',
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  growCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'LemonMilk',
    color: '#000',
    marginBottom: 6,
  },
  cardDetail: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#333',
    marginBottom: 2,
  },
  checkbox: {
    marginLeft: 12,
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#ff6666',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  fullWidthButton: {
    backgroundColor: 'white',
    paddingVertical: 14,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 30,
  },
  buttonText: {
    fontFamily: 'LemonMilkLight',
    fontSize: 12,
    color: '#000',
  },
});
