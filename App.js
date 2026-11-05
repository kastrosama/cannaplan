// App.js
import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme, createNavigationContainerRef } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { ThemeProvider, useTheme, fonts } from './theme/theme';
import HomeScreen from './screens/HomeScreen';
import SelectNutrientsScreen from './screens/SelectNutrientsScreen';
import CreateGrowBioBizz from './screens/CreateGrowBioBizz';
import CreateGrowDutchPro from './screens/CreateGrowDutchPro';
import CreateGrowAdvancedNutrients from './screens/CreateGrowAdvancedNutrients';
import CreateGrowCanna from './screens/CreateGrowCanna';
import CreateGrowGeneralHydroponics from './screens/CreateGrowGeneralHydroponics';
import CreateGrowPlagron from './screens/CreateGrowPlagron';
import CurrentWeekSchedule from './screens/CurrentWeekSchedule';
import FeedingScheduleSummary from './screens/FeedingScheduleSummary';
import SettingsScreen from './screens/SettingsScreen';
import PreviousGrowsScreen from './screens/PreviousGrowsScreen';
import AboutScreen from './screens/AboutScreen';
import EasterEggScreen from './screens/EasterEggScreen';
import RemindersScreen from './screens/RemindersScreen';
import { rescheduleAllReminders } from './utils/reminders';
import { getGrowByKey, setCurrentGrow } from './utils/growStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

const Stack = createNativeStackNavigator();
const navigationRef = createNavigationContainerRef();

// Tapping a feed reminder opens that grow's weekly screen.
async function openFromNotification(response) {
  const growKey = response?.notification?.request?.content?.data?.growKey;
  if (!growKey) return;
  const grow = await getGrowByKey(growKey);
  if (!grow) return;
  await setCurrentGrow(grow);
  if (navigationRef.isReady()) {
    navigationRef.navigate('Main', { screen: 'Feeding Schedule', params: { refresh: Date.now() } });
  }
}
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'leaf',
  'Select Nutrients': 'add-circle',
  'Feeding Schedule': 'water',
  Settings: 'settings',
};

function Tabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textFaint,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          height: 64 + insets.bottom,
          paddingTop: 4,
          paddingBottom: 4 + insets.bottom,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14 },
        tabBarIcon: ({ color, focused, size }) => {
          const base = TAB_ICONS[route.name];
          return <Ionicons name={focused ? base : `${base}-outline`} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Grows' }} />
      <Tab.Screen name="Select Nutrients" component={SelectNutrientsScreen} options={{ title: 'New grow' }} />
      <Tab.Screen name="Feeding Schedule" component={CurrentWeekSchedule} options={{ title: 'This week' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
}

function Root() {
  const { theme } = useTheme();
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.bg,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      primary: theme.accent,
    },
  };

  useEffect(() => {
    let sub;
    try {
      sub = Notifications.addNotificationResponseReceivedListener((r) => {
        openFromNotification(r).catch(() => {});
      });
    } catch {
      // notifications unavailable
    }
    return () => sub?.remove();
  }, []);

  const onReady = () => {
    try {
      const last = Notifications.getLastNotificationResponse();
      if (last) {
        Notifications.clearLastNotificationResponse();
        openFromNotification(last).catch(() => {});
      }
    } catch {
      // notifications unavailable (e.g. web preview)
    }
  };

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef} onReady={onReady}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="Create Grow BioBizz" component={CreateGrowBioBizz} />
        <Stack.Screen name="Create Grow DutchPro" component={CreateGrowDutchPro} />
        <Stack.Screen name="Create Grow AdvancedNutrients" component={CreateGrowAdvancedNutrients} />
        <Stack.Screen name="Create Grow CANNA" component={CreateGrowCanna} />
        <Stack.Screen name="Create Grow GeneralHydroponics" component={CreateGrowGeneralHydroponics} />
        <Stack.Screen name="Create Grow Plagron" component={CreateGrowPlagron} />
        <Stack.Screen name="FeedingScheduleSummary" component={FeedingScheduleSummary} />
        <Stack.Screen name="Previous Grows" component={PreviousGrowsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="EasterEgg" component={EasterEggScreen} />
        <Stack.Screen name="Reminders" component={RemindersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    LemonMilk: require('./assets/fonts/LEMONMILK-Medium.otf'),
    LemonMilkLight: require('./assets/fonts/LEMONMILK-Light.otf'),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const ready = fontsLoaded || !!fontError;

  // Rebuild feed reminders on every launch so their text matches the current week.
  useEffect(() => {
    rescheduleAllReminders().catch(() => {});
  }, []);
  const onLayout = useCallback(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <View style={{ flex: 1 }} onLayout={onLayout}>
          <Root />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
