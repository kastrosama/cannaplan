import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function SettingsScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  if (!fontsLoaded) return null;

  const handleDeleteAll = async () => {
    Alert.alert(
      'Reset App',
      'This will permanently delete all saved grows and reset the app. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('Reset Complete', 'All data has been cleared.');
            } catch (e) {
              console.error('Failed to clear storage:', e);
              Alert.alert('Error', 'Something went wrong while resetting.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
        <Text style={styles.subtitle}>Settings</Text>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAll}>
          <Text style={styles.buttonText}>Delete All Data</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.fullWidthButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a2cb95',
    paddingHorizontal: 40,
    paddingTop: 50,
    paddingBottom: 30,
    justifyContent: 'space-between',
  },
  topContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LemonMilk',
    textAlign: 'center',
    color: 'white',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: 'LemonMilkLight',
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    marginBottom: 30,
  },
  dangerButton: {
    backgroundColor: '#ff6666',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  fullWidthButton: {
    backgroundColor: 'white',
    borderRadius: 5,
    paddingVertical: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
});
