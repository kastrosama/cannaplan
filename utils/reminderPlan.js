// reminderPlan.js — works out WHICH feed reminders to send and WHAT they say.
// Pure functions (no native code) so they can be unit-tested.

import moment from 'moment';
import { getSchedule, getWeekNumber, getMixingRows, parseWater, formatWater } from './growHelpers';

export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DEFAULT_REMINDER = { days: [1, 3, 5], hour: 18, minute: 0 };

// "Mon, Wed, Fri at 18:00"
export const describeReminder = (cfg) => {
  if (!cfg || !cfg.days?.length) return 'Off';
  const order = [1, 2, 3, 4, 5, 6, 0];
  const days = order.filter((d) => cfg.days.includes(d)).map((d) => DAY_LABELS[d]);
  const label = days.length === 7 ? 'Every day' : days.join(', ');
  return `${label} at ${String(cfg.hour).padStart(2, '0')}:${String(cfg.minute).padStart(2, '0')}`;
};

// One reminder's text for a given date.
export const reminderContent = (grow, schedule, date, units = 'metric') => {
  const weekNo = getWeekNumber(grow.startDate, date);
  const week = schedule.find((w) => w.week === weekNo);
  if (!week) return null;
  const name = grow.strain || 'your plant';
  const water = parseWater(grow.waterAmount);

  if (week.kind === 'harvest') {
    return { title: `🌾 Harvest week: ${name}`, body: 'No feeding. Check the trichomes, then harvest, dry and cure.' };
  }
  const { doses, readings } = getMixingRows(week, water, units);

  if (week.kind === 'flush') {
    const extras = doses.map((r) => `${r.key} ${r.total}`).join(' · ');
    const ph = readings.find((r) => r.key === 'pH');
    return {
      title: `💧 Flush day: ${name}`,
      body: `Week ${weekNo}: ${formatWater(water, units)} plain water${extras ? ` + ${extras}` : ' only'}${ph ? ` · pH ${ph.perL}` : ''}.`,
    };
  }
  const shown = doses.slice(0, 3).map((r) => `${r.key} ${r.total}`);
  const more = doses.length > 3 ? ` +${doses.length - 3} more` : '';
  const ph = readings.find((r) => r.key === 'pH');
  return {
    title: `🌱 Feed ${name} · Week ${weekNo}`,
    body: `${formatWater(water, units)}: ${shown.join(' · ')}${more}${ph ? ` · pH ${ph.perL}` : ''}`,
  };
};

/**
 * All reminders for one grow from `now` onwards (max `limit`).
 * Harvest week only gets one reminder (its first feed day).
 */
export const buildReminderPlan = (grow, cfg, { now = moment(), units = 'metric', horizonDays = 70, limit = 40 } = {}) => {
  if (!grow || !cfg?.days?.length) return [];
  const schedule = getSchedule(grow);
  const out = [];
  let harvestDone = false;

  for (let i = 0; i <= horizonDays && out.length < limit; i++) {
    const date = moment(now).startOf('day').add(i, 'days').hour(cfg.hour).minute(cfg.minute).second(0);
    if (!cfg.days.includes(date.day()) || !date.isAfter(now)) continue;

    const weekNo = getWeekNumber(grow.startDate, date);
    const week = schedule.find((w) => w.week === weekNo);
    if (!week) {
      if (weekNo > schedule.length) break; // grow finished
      continue; // not started yet
    }
    if (week.kind === 'harvest') {
      if (harvestDone) continue;
      harvestDone = true;
    }
    const content = reminderContent(grow, schedule, date, units);
    if (content) out.push({ date: date.toDate(), ...content });
  }
  return out;
};
