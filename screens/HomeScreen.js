import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import moment from 'moment';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    const checkCurrentGrow = async () => {
      try {
        await AsyncStorage.removeItem('grow_current');
        console.log('grow_current cleared on Home load');

        const keys = await AsyncStorage.getAllKeys();
        const growKeys = keys.filter(key => key.startsWith('grow_') && key !== 'grow_current');

        const grows = await Promise.all(
          growKeys.map(async (key) => {
            const item = await AsyncStorage.getItem(key);
            return JSON.parse(item);
          })
        );

        const today = moment();
        const matchingGrow = grows.find(g => {
          const start = moment(g.startDate);
          const totalWeeks = parseInt(g.vegWeeks) + 8 + 2;
          const end = start.clone().add(totalWeeks, 'weeks');
          return today.isSameOrAfter(start) && today.isSameOrBefore(end);
        });

        if (matchingGrow) {
          await AsyncStorage.setItem('grow_current', JSON.stringify(matchingGrow));
          setShowSchedule(true);
        }
      } catch (e) {
        console.error('Error checking grow_current:', e);
      }
    };

    checkCurrentGrow();
  }, []);

  const handleLoadSchedule = async () => {
    const current = await AsyncStorage.getItem('grow_current');
    if (current) {
      navigation.navigate('Feeding Schedule');
    } else {
      Alert.alert('No Current Grow', 'Please create a grow plan first.');
    }
  };

  const openSeedStore = () => {
    Linking.openURL('https://cbdynamics.nl');
  };

  if (!fontsLoaded) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
      <Text style={styles.subtitle}>Smart Growing Made Simple</Text>

      <Image
        source={require('../assets/bigbud.png')} 
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.buttonGroup}>
        <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('Select Nutrients')}>
          <Text style={styles.buttonText}>Click to Start</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('Previous Grows')}>
          <Text style={styles.buttonText}>Saved Grows</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.buttonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('About')}>
          <Text style={styles.buttonText}>About</Text>
        </TouchableOpacity>

        {/*
<TouchableOpacity style={styles.fakeButton} onPress={openSeedStore}>
  <Text style={styles.buttonText}>Buy Seeds</Text>
</TouchableOpacity>
*/}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 40,
    justifyContent: 'flex-start',
    backgroundColor: '#a2cb95',
    flexGrow: 1,
  },
  title: {
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: 'LemonMilkLight',
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 30,
  },
  buttonGroup: {
    marginTop: 10,
  },
  fakeButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    fontFamily: 'LemonMilkLight',
    fontSize: 12,
    color: '#000',
  },
});
