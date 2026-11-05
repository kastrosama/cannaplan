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

// The current grow keeps its storage key so reminders and notification taps can find it.
export async function setCurrentGrow(grow) {
  await AsyncStorage.setItem('grow_current', JSON.stringify(grow));
}

export async function getGrowByKey(key) {
  const json = key ? await AsyncStorage.getItem(key) : null;
  return json ? { key, ...JSON.parse(json) } : null;
}

// Older "current grow" copies have no key: match them against saved grows.
export async function resolveGrowKey(grow) {
  if (!grow) return null;
  if (grow.key) return grow.key;
  const all = await loadAllGrows();
  const match = all.find(
    (g) => g.strain === grow.strain && g.startDate === grow.startDate && g.nutrients === grow.nutrients
  );
  return match ? match.key : null;
}

export async function getCurrentGrow() {
  const json = await AsyncStorage.getItem('grow_current');
  return json ? JSON.parse(json) : null;
}

export async function deleteGrows(keys) {
  await AsyncStorage.multiRemove(keys);
}
