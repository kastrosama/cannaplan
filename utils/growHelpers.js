// growHelpers.js
// Shared logic used by every screen: schedule normalisation, phases,
// week maths, dose parsing and water-amount parsing.

import moment from 'moment';
import { generateFeedingSchedule } from './generateFeedingSchedule';

// Keys on a schedule week that are not nutrients
export const META_KEYS = ['week', 'phase', 'stage', 'kind'];
// Keys that are readings/targets rather than doses
export const READING_KEYS = ['pH', 'EC', 'TDS', 'PPM'];

const classifyPhase = (phase = '') => {
  const p = phase.toLowerCase();
  if (p.includes('harvest')) return 'harvest';
  if (p.includes('flush')) return 'flush';
  if (p.includes('flower') || p.includes('bloom') || p.includes('ripen')) return 'flower';
  return 'veg';
};

const STANDARD_LABEL = /^(vegetative|flowering) week \d+$|^flush week( \d+)?$|^harvest week$/i;

/**
 * Always returns an array of weeks with consistent labels:
 *  - kind:  'veg' | 'flower' | 'flush' | 'harvest'
 *  - phase: 'Vegetative Week n' | 'Flowering Week n' | 'Flush Week' | 'Harvest Week'
 *  - stage: the brand's own stage name when it had one (e.g. GH "Mid Bloom")
 */
export const getSchedule = (growData) => {
  if (!growData) return [];
  const raw = generateFeedingSchedule(growData);
  const weeks = Array.isArray(raw) ? raw : raw?.schedule || [];

  let vegCount = 0;
  let flowerCount = 0;

  return weeks
    .slice()
    .sort((a, b) => a.week - b.week)
    .map((w) => {
      const kind = classifyPhase(w.phase);
      const out = { ...w, kind };
      if (w.phase && !STANDARD_LABEL.test(w.phase.trim())) out.stage = w.phase;

      if (kind === 'veg') out.phase = `Vegetative Week ${++vegCount}`;
      else if (kind === 'flower') out.phase = `Flowering Week ${++flowerCount}`;
      else if (kind === 'flush') out.phase = 'Flush Week';
      else out.phase = 'Harvest Week';
      return out;
    });
};

export const isAutoflower = (growData) => growData?.type === 'Autoflower';

// Autoflowers store their TOTAL duration in vegWeeks; photoperiods add 8 flower + flush + harvest.
export const getTotalWeeks = (growData) => {
  const n = parseInt(growData?.vegWeeks, 10) || 0;
  return isAutoflower(growData) ? n : n + 10;
};

const startOfGrow = (startDate) => moment(startDate).startOf('day');

// 1-based week number for a date (defaults to today). 0 or less = not started yet.
export const getWeekNumber = (startDate, date = moment()) => {
  const days = moment(date).startOf('day').diff(startOfGrow(startDate), 'days');
  return Math.floor(days / 7) + 1;
};

export const getDayNumber = (startDate, date = moment()) =>
  moment(date).startOf('day').diff(startOfGrow(startDate), 'days') + 1;

export const getWeekRange = (startDate, weekNumber) => {
  const s = startOfGrow(startDate).add(weekNumber - 1, 'weeks');
  return `${s.format('DD MMM')} – ${s.clone().add(6, 'days').format('DD MMM')}`;
};

// Human phase description + light cycle for a given week.
export const getPhaseInfo = (growData, schedule, weekNumber) => {
  const auto = isAutoflower(growData);
  if (weekNumber < 1) return { label: 'Not started yet', light: '-' };

  const week = schedule.find((w) => w.week === weekNumber);
  if (!week) return { label: 'Schedule Complete', light: '-' };

  const vegTotal = schedule.filter((w) => w.kind === 'veg').length;
  const flowerTotal = schedule.filter((w) => w.kind === 'flower').length;
  const n = parseInt(week.phase.replace(/\D+/g, ''), 10);

  switch (week.kind) {
    case 'veg':
      return { label: `Vegetation Week ${n} of ${vegTotal}`, light: auto ? '18/6' : '24/0' };
    case 'flower':
      return { label: `Flowering Week ${n} of ${flowerTotal}`, light: auto ? '18/6' : '12/12' };
    case 'flush':
      return { label: 'Flush Week', light: auto ? '18/6' : '12/12' };
    default:
      return { label: 'Harvest Week', light: '-' };
  }
};

// Accepts "10", "2.5" and European "2,5". Returns NaN when invalid.
export const parseWater = (value) => {
  if (typeof value === 'number') return value;
  const n = parseFloat(String(value ?? '').trim().replace(',', '.'));
  return n > 0 ? n : NaN;
};

const fmt = (n) => String(Math.round(n * 100) / 100);

/**
 * Turns any dose value the generators produce into something displayable.
 * Handles: 2, '2ml/L', '2.5 ml', '0.1 – 1 ml', '0.5g/L', '0.4 ml (1x per week)',
 * '0.5ml/L spray (1x)', 'Spray 1x per week'.
 *
 * Returns { skip, perL, total }:
 *  - skip: true for zero doses (nothing to add this week)
 *  - perL: text for the per-litre column
 *  - total: text for the total column (sprays are NOT added to the reservoir)
 */
export const describeDose = (value, water) => {
  if (typeof value === 'number') {
    if (value === 0) return { skip: true };
    return {
      perL: `${fmt(value)} ml`,
      total: isNaN(water) ? '—' : `${(value * water).toFixed(1)} ml`,
    };
  }

  const text = String(value ?? '').trim();
  const lower = text.toLowerCase();
  const nums = (text.match(/\d+(?:[.,]\d+)?/g) || []).map((s) => parseFloat(s.replace(',', '.')));
  const unit = /\d\s*g\b/i.test(text) ? 'g' : 'ml';
  const freq = (text.match(/\((.*?)\)/) || [])[1];
  const isSpray = lower.includes('spray');
  const isRange = nums.length >= 2 && /[–-]/.test(text) && !freq;

  if (isSpray) {
    const amount = nums.length && !lower.startsWith('spray') ? `${fmt(nums[0])} ${unit}/L ` : '';
    return { perL: `${amount}spray${freq ? ` (${freq})` : ''}`.trim(), total: 'Foliar only' };
  }

  if (!nums.length) return { perL: text || '—', total: '—' };
  if (!isRange && nums[0] === 0) return { skip: true };

  if (isRange) {
    const [min, max] = nums;
    return {
      perL: `${fmt(min)}–${fmt(max)} ${unit}`,
      total: isNaN(water) ? '—' : `${(min * water).toFixed(1)}–${(max * water).toFixed(1)} ${unit}`,
    };
  }

  const n = nums[0];
  const note = freq ? ` (${freq})` : '';
  return {
    perL: `${fmt(n)} ${unit}${note}`,
    total: isNaN(water) ? '—' : `${(n * water).toFixed(1)} ${unit}`,
  };
};

// Nutrient rows for a week, ready to render. Readings (pH/EC/TDS) come last.
export const getWeekRows = (week, water) => {
  if (!week) return [];
  const entries = Object.entries(week).filter(([k]) => !META_KEYS.includes(k));
  const doses = [];
  const readings = [];
  for (const [key, val] of entries) {
    if (READING_KEYS.includes(key)) {
      readings.push({ key, label: key === 'pH' ? 'pH' : key.toUpperCase(), perL: String(val), total: '—', reading: true });
    } else if (key === 'Water') {
      continue;
    } else {
      const d = describeDose(val, water);
      if (!d.skip) doses.push({ key, label: key.toUpperCase(), perL: d.perL, total: d.total });
    }
  }
  return [...doses, ...readings];
};

// Unique storage key so two grows of the same strain on the same day never overwrite.
export const makeGrowKey = (strain, startDate) => {
  const strainPart = (strain.trim().split(/\s+/)[0] || 'Grow').replace(/[^\w-]/g, '');
  return `grow_${strainPart}_${moment(startDate).format('YYYY-MM-DD')}_${Date.now()}`;
};
