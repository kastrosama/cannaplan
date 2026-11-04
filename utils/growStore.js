// growStore.js — reading and writing saved grows in AsyncStorage.

import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment';

const isGrowKey = (k) => k.startsWith('grow_') && k !== 'grow_current';

export async function loadAllGrows() {
  const keys = (await AsyncStorage.getAllKeys()).filter(isGrowKey);
  const pairs = await AsyncStorage.multiGet(keys);
  return pairs
    .map(([key, json]) => {
      try {
        return { key, ...JSON.parse(json) };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => moment(b.startDate).valueOf() - moment(a.startDate).valueOf());
}

export async function setCurrentGrow(grow) {
  const { key, ...data } = grow;
  await AsyncStorage.setItem('grow_current', JSON.stringify(data));
}

export async function getCurrentGrow() {
  const json = await AsyncStorage.getItem('grow_current');
  return json ? JSON.parse(json) : null;
}

export async function deleteGrows(keys) {
  await AsyncStorage.multiRemove(keys);
}
