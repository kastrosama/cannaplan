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

        <TouchableOpacity
          style={styles.brandButtonBox}
          onPress={() => navigation.navigate('Create Grow AdvancedNutrients')}
>
          <Image source={require('../assets/nutrienticons/advancednutrients.jpg')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.brandLabel}>Advanced Nutrients</Text>
        </TouchableOpacity>

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
  brandButtonBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
    width: '100%',
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  brandLabel: {
    fontSize: 14,
    fontFamily: 'LemonMilkLight',
    color: '#000',
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
