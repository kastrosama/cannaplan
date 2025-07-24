import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Linking,
  Image,
} from 'react-native';
import { useFonts } from 'expo-font';

const { width: screenWidth } = Dimensions.get('window');
const dynamicFontSize = Math.min(Math.round(screenWidth * 0.11), 42);

export default function AboutScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    'LemonMilk': require('../assets/fonts/LEMONMILK-Medium.otf'),
    'LemonMilkLight': require('../assets/fonts/LEMONMILK-Light.otf'),
  });

  if (!fontsLoaded) return null;

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      alert('Unable to open this link.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.contentBox}>
        <Text style={[styles.title, { fontSize: dynamicFontSize }]}>CANNAPLAN</Text>
        <Text style={styles.subtitle}>About This App</Text>

        <Image
          source={require('../assets/bigbud.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.contentText}>
          CannaPlan is a simple, free mobile app made to help small growers plan and manage their grows from start to finish. Whether you're just starting out or planning your next run, this app helps you stay organized and on track.
        </Text>

        <Text style={styles.contentText}>
          Your privacy matters. That's why CannaPlan works completely offline, no accounts, no data collection, and no tracking. Everything is stored right on your phone, and nothing ever leaves your device unless you choose to export it.
        </Text>

        <Text style={styles.contentText}>
          CannaPlan includes support for BioBizz, DutchPro, and Advanced Nutrients for now, but more are coming! Just choose your nutrients and growing style, and the app builds a week-by-week schedule tailored to your setup. You'll get guidance on water amounts, feeding doses, light cycles, and even{' '}
        pH. All in one easy view.
        </Text>


        <Text style={styles.contentText}>
          This app is a personal project built by growers, for growers. It's 100% free, no ads, no nonsense, just tools that work.
        </Text>

        <Text style={styles.resourceHeader}>Links</Text>
        <TouchableOpacity onPress={() => openLink('mailto:cannaplan.app@gmail.com')}>
          <Text style={styles.linkText}>Email</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.reddit.com/r/cannaplan/')}>
          <Text style={styles.linkText}>reddit - r/cannaplan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.instagram.com/cannaplanapp/')}>
          <Text style={styles.linkText}>Instagram</Text>
        </TouchableOpacity>

        <Text style={styles.resourceHeader}>Nutrient links</Text>
        <TouchableOpacity onPress={() => openLink('https://www.biobizz.com/')}>
          <Text style={styles.linkText}>BioBizz Official Site</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://dutchpro.com/')}>
          <Text style={styles.linkText}>DutchPro Official Site</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://www.advancednutrients.com/')}>
          <Text style={styles.linkText}>Advanced Nutrients Official Site</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.fakeButton} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 60,
    backgroundColor: '#a2cb95',
    flexGrow: 1,
  },
  contentBox: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'LemonMilk',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'LemonMilkLight',
    color: '#000',
    marginBottom: 24,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: 120,
    marginBottom: 24,
  },
  contentText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
    marginBottom: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  resourceHeader: {
    fontSize: 14,
    fontFamily: 'LemonMilk',
    color: '#000',
    marginTop: 30,
    marginBottom: 14,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#2e7d32',
    marginBottom: 10,
    marginTop: 2,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  fakeButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
    color: '#000',
  },
  hiddenDot: {
    color: '#000', // Blends with contentText
    fontSize: 12,
    fontFamily: 'LemonMilkLight',
  },
  easterEggLink: {
  fontFamily: 'LemonMilkLight',
  color: '#000', // match normal text color
  textDecorationLine: 'none', // keep it hidden
},
});
