import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions } from 'react-native';
import { useFonts } from 'expo-font';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function SelectNutrientsScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.container}>
      <View style={styles.topContent}>
        <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
        <Text style={styles.subtitle}>Choose Your Nutrients</Text>

        {/* First Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.brandButtonBox}
            onPress={() => navigation.navigate('Create Grow BioBizz')}
          >
            <Image source={require('../assets/nutrienticons/biobizz.jpeg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandLabel}>BioBizz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.brandButtonBox}
            onPress={() => navigation.navigate('Create Grow DutchPro')}
          >
            <Image source={require('../assets/nutrienticons/dutchpro.jpeg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandLabel}>Dutch Pro</Text>
          </TouchableOpacity>
        </View>

        {/* Second Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.brandButtonBox}
            onPress={() => navigation.navigate('Create Grow AdvancedNutrients')}
          >
            <Image source={require('../assets/nutrienticons/advancednutrients.jpg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandLabel}>Advanced Nutrients</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.brandButtonBox}
            onPress={() => navigation.navigate('Create Grow CANNA')}
          >
            <Image source={require('../assets/nutrienticons/canna.jpg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandLabel}>CANNA</Text>
          </TouchableOpacity>
        </View>

        {/* Third Row */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.brandButtonBox}
            onPress={() => navigation.navigate('Create Grow GeneralHydroponics')}
          >
            <Image source={require('../assets/nutrienticons/generalhydroponics.jpg')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brandLabel}>General Hydroponics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.brandButtonBox, styles.placeholderBox]}
          >
            <Text style={styles.placeholderText}>Coming Soon</Text>
          </TouchableOpacity>
        </View>

      </View>

      <TouchableOpacity
        style={styles.fullWidthButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>Home</Text>
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  brandButtonBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '48%', // Slightly less than 50% to allow for spacing
    minHeight: 120, // Ensure consistent height
  },
  placeholderBox: {
    backgroundColor: '#e0e0e0',
    opacity: 0.6,
  },
  logo: {
    width: 100, // Slightly smaller to fit better
    height: 40,
    marginBottom: 8,
  },
  brandLabel: {
    fontSize: 12, // Slightly smaller for better fit
    fontFamily: 'LemonMilkLight',
    color: '#000',
    textAlign: 'center',
    lineHeight: 14, // Better line spacing for multi-line text
  },
  placeholderText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#666',
    textAlign: 'center',
  },
  fullWidthButton: {
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    paddingVertical: 15,
    width: '100%',
  },
  homeButtonText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
});