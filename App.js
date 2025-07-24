import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import CreateGrowBioBizz from './screens/CreateGrowBioBizz';
import CreateGrowDutchPro from './screens/CreateGrowDutchPro';
import SelectNutrientsScreen from './screens/SelectNutrientsScreen';
import CurrentWeekSchedule from './screens/CurrentWeekSchedule';
import FeedingScheduleSummary from './screens/FeedingScheduleSummary';
import SettingsScreen from './screens/SettingsScreen';
import PreviousGrowsScreen from './screens/PreviousGrowsScreen';
import AboutScreen from './screens/AboutScreen';
import CreateGrowAdvancedNutrients from './screens/CreateGrowAdvancedNutrients';
import EasterEggScreen from './screens/EasterEggScreen'; 

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Select Nutrients" component={SelectNutrientsScreen} />
        <Stack.Screen name="Create Grow BioBizz" component={CreateGrowBioBizz} />
        <Stack.Screen name="Create Grow DutchPro" component={CreateGrowDutchPro} />
        <Stack.Screen name="Feeding Schedule" component={CurrentWeekSchedule} />
        <Stack.Screen name="FeedingScheduleSummary" component={FeedingScheduleSummary} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Previous Grows" component={PreviousGrowsScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Create Grow AdvancedNutrients" component={CreateGrowAdvancedNutrients} />
        <Stack.Screen name="EasterEgg" component={EasterEggScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
