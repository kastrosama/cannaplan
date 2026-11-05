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

// ---------- Units ----------
// Everything is stored and calculated in litres. US mode only changes what is shown:
// water in gallons and doses "per gallon". Totals stay in ml/g (how nutrients are measured).
export const GAL = 3.78541;
export const unitShort = (units) => (units === 'us' ? 'gal' : 'L');
export const unitWord = (units) => (units === 'us' ? 'gallon' : 'litre');

// "10 L" / "2,5 L" or "2.6 gal"
export const formatWater = (litres, units = 'metric') => {
  if (isNaN(litres)) return '—';
  if (units === 'us') return `${Math.round((litres / GAL) * 10) / 10} gal`;
  return `${String(Math.round(litres * 10) / 10).replace('.', ',')} L`;
};

// User input in the current unit -> litres (NaN if invalid)
export const waterInputToLitres = (value, units = 'metric') => {
  const n = parseWater(value);
  return isNaN(n) ? NaN : units === 'us' ? Math.round(n * GAL * 1000) / 1000 : n;
};

// Litres -> the number to show in an input field for the current unit
export const litresToInput = (litres, units = 'metric') =>
  isNaN(litres) ? '' : units === 'us' ? String(Math.round((litres / GAL) * 10) / 10) : String(litres).replace('.', ',');

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
export const describeDose = (value, water, units = 'metric') => {
  const tot = (n) => `${fmt(Math.round(n * 10) / 10)}`;
  const noWater = isNaN(water);
  const k = units === 'us' ? GAL : 1; // per-litre -> per-gallon
  const per = (n) => (units === 'us' ? String(Math.round(n * k * 10) / 10) : fmt(n));
  const short = unitShort(units);

  if (typeof value === 'number') {
    if (value === 0) return { skip: true };
    return { perL: `${per(value)} ml`, total: noWater ? '—' : `${tot(value * water)} ml` };
  }

  const text = String(value ?? '').trim();
  const lower = text.toLowerCase();
  const nums = (text.match(/\d+(?:[.,]\d+)?/g) || []).map((s) => parseFloat(s.replace(',', '.')));
  const unit = /\d\s*g\b/i.test(text) ? 'g' : 'ml';
  const note = (text.match(/\((.*?)\)/) || [])[1];
  const isSpray = lower.includes('spray');
  const isRange = nums.length >= 2 && /[–-]/.test(text) && !note;

  if (isSpray) {
    if (lower.startsWith('spray') || !nums.length) {
      return { perL: text.charAt(0).toUpperCase() + text.slice(1), total: 'Foliar only', spray: true };
    }
    return { perL: `${per(nums[0])} ${unit}/${short}`, note: note, total: 'Foliar only', spray: true };
  }

  if (!nums.length) return { perL: text || '—', total: '', text: true };
  if (!isRange && nums[0] === 0) return { skip: true };

  if (isRange) {
    const [min, max] = nums;
    return {
      perL: `${per(min)}–${per(max)} ${unit}`,
      total: noWater ? '—' : `${tot(min * water)}–${tot(max * water)} ${unit}`,
    };
  }

  const n = nums[0];
  return { perL: `${per(n)} ${unit}`, note, total: noWater ? '—' : `${tot(n * water)} ${unit}` };
};

// Nutrient rows for a week, ready to render. Readings (pH/EC/TDS) come last.
export const getWeekRows = (week, water, units = 'metric') => {
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
      const d = describeDose(val, water, units);
      if (!d.skip) doses.push({ key, label: key.toUpperCase(), perL: d.perL, note: d.note, total: d.total, spray: !!d.spray, text: !!d.text });
    }
  }
  return [...doses, ...readings];
};

// Unique storage key so two grows of the same strain on the same day never overwrite.
export const makeGrowKey = (strain, startDate) => {
  const strainPart = (strain.trim().split(/\s+/)[0] || 'Grow').replace(/[^\w-]/g, '');
  return `grow_${strainPart}_${moment(startDate).format('YYYY-MM-DD')}_${Date.now()}`;
};

// ---------- Mixing order ----------
// General guidance: silica first, then Cal-Mag, then base nutrients (Micro, A before B),
// then additives. pH/EC are adjusted last. Brand labels win if they differ.
const mixRank = (name) => {
  const n = name.toLowerCase();
  if (n.includes('silica') || n.includes('silicon')) return 0;
  if (/cal[\s·-]?mag|camg|calimagic/.test(n)) return 1;
  if (n.includes('micro') && !n.includes('microbe')) return 2; // FloraMicro etc., not BioBizz Microbes
  if (/\ba$/.test(n)) return 3;
  if (/\bb$/.test(n)) return 4;
  if (/^(bio·grow|bio·bloom|fish·mix|flora(gro|bloom)|floranova|maxi(gro|bloom)|biothrive|iguana juice|alga (grow|bloom)|cocos |hydro (a|b)$|terra |aqua |substra |grow$|bloom$)/.test(n)) return 3.5;
  return 5;
};

// Rows sorted into a suggested mixing order (readings stay last).
export const getMixingRows = (week, water, units = 'metric') => {
  const rows = getWeekRows(week, water, units);
  const doses = rows.filter((r) => !r.reading && !r.spray);
  const sprays = rows.filter((r) => r.spray);
  const readings = rows.filter((r) => r.reading);
  const ordered = doses
    .map((r, i) => ({ r, i, k: mixRank(r.key) }))
    .sort((a, b) => a.k - b.k || a.i - b.i)
    .map((x) => x.r);
  return { doses: ordered, sprays, readings };
};

// ---------- Grow overview ----------

// Phase segments for a progress bar: [{ kind, weeks }]
export const getPhaseSegments = (schedule) => {
  const out = [];
  for (const w of schedule) {
    const last = out[out.length - 1];
    if (last && last.kind === w.kind) last.weeks += 1;
    else out.push({ kind: w.kind, weeks: 1 });
  }
  return out;
};

// Everything a grow card needs.
export const getGrowOverview = (growData, date = moment()) => {
  const schedule = getSchedule(growData);
  const total = schedule.length || getTotalWeeks(growData);
  const week = getWeekNumber(growData.startDate, date);
  const day = getDayNumber(growData.startDate, date);
  const current = schedule.find((w) => w.week === week) || null;
  const status = week < 1 ? 'upcoming' : week > total ? 'finished' : 'active';
  const info = getPhaseInfo(growData, schedule, week);
  return {
    schedule,
    total,
    week,
    day,
    current,
    status,
    phaseLabel: info.label,
    light: info.light,
    segments: getPhaseSegments(schedule),
    progress: Math.max(0, Math.min(1, (day - 1) / (total * 7))),
  };
};

export const getMediumLabel = (g) =>
  g.nutrients === 'DutchPro'
    ? g.dutchProSubtype
    : g.nutrients === 'AdvancedNutrients'
    ? g.advancedNutrientsSubtype
    : g.nutrients === 'CANNA'
    ? g.cannaMedium
    : g.nutrients === 'GeneralHydroponics'
    ? g.generalHydroponicsMedium
    : g.nutrients === 'Plagron'
    ? g.plagronLine
    : g.soilType;
