// reminders.js — scheduling feed-day notifications on the phone.
//
// Reminders are dated one-off notifications holding that day's actual mix, so they're
// rebuilt from scratch whenever the app opens or a setting changes. That keeps the
// content right as the grow moves through its weeks.

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

import { loadAllGrows } from './growStore';
import { buildReminderPlan } from './reminderPlan';

const CONFIG_KEY = 'reminders';
const CHANNEL_ID = 'feed-reminders';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function loadReminderConfigs() {
  try {
    return JSON.parse((await AsyncStorage.getItem(CONFIG_KEY)) || '{}');
  } catch {
    return {};
  }
}

async function saveReminderConfigs(all) {
  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(all));
}

export async function getReminderConfig(growKey) {
  return (await loadReminderConfigs())[growKey] || null;
}

// Returns true when notifications are allowed.
export async function ensureNotificationPermission() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Feed reminders',
      description: 'Reminders on your feed days with what to mix',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const asked = await Notifications.requestPermissionsAsync();
  return !!asked.granted;
}

export async function setReminderConfig(growKey, cfg) {
  const all = await loadReminderConfigs();
  if (cfg && cfg.days?.length) all[growKey] = cfg;
  else delete all[growKey];
  await saveReminderConfigs(all);
  await rescheduleAllReminders();
}

export async function removeReminderConfigs(growKeys) {
  const all = await loadReminderConfigs();
  growKeys.forEach((k) => delete all[k]);
  await saveReminderConfigs(all);
  await rescheduleAllReminders();
}

// Cancel everything and schedule fresh reminders for every grow that has them.
export async function rescheduleAllReminders() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const configs = await loadReminderConfigs();
    const keys = Object.keys(configs);
    if (!keys.length) return 0;

    const perm = await Notifications.getPermissionsAsync();
    if (!perm.granted) return 0;

    const units = (await AsyncStorage.getItem('settings_units')) || 'metric';
    const grows = await loadAllGrows();
    let count = 0;
    for (const grow of grows) {
      const cfg = configs[grow.key];
      if (!cfg) continue;
      for (const r of buildReminderPlan(grow, cfg, { units })) {
        await Notifications.scheduleNotificationAsync({
          content: { title: r.title, body: r.body, data: { type: 'feed', growKey: grow.key } },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL_ID },
        });
        count++;
      }
    }
    return count;
  } catch (e) {
    console.warn('Could not schedule reminders', e);
    return 0;
  }
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}
