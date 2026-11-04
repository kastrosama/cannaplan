// plagron.js — Plagron grow schedules, transcribed from Plagron's official charts.
//
// Sources (plagron.com/downloads/en/...):
//   100% TERRA   grow-schedule-100-terra    PL-23-083/04/EN
//   100% COCO    grow-schedule-100-coco     PL-23-083/04/EN  (hand-feeding block)
//   100% HYDRO   grow-schedule-100-hydro    PL-23-083/04/EN
//   100% NATURAL grow-schedule-100-natural  PL-25-083/08/EN
//
// Doses are stored EXACTLY as printed: ml per 10 litres. The engine converts to ml/L.
// Chart layout is always 11 weeks: 2 grow, 8 bloom, 1 "only water" (harvest/flush).
// "To extend the grow phase, repeat the recommended dosage from week 2."
//
// Each product row is an array of 11 values (null = not used that week).

const _ = null;

// Additives shared by the soil/coco schedules
const POWER_ROOTS = [10, 10, 10, 10, 10, _, _, _, _, _, _];
const PURE_ZYM = [10, 10, 10, 10, 10, 10, _, _, _, _, _];
const SUGAR_ROYAL = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, _];
const POWER_BUDS = [_, _, 10, 10, 10, 10, 10, 10, 10, 10, _];
const GREEN_SENSATION = [_, _, _, _, _, 10, 10, 10, 10, 10, _];

export const PLAGRON_LINES = {
  'Terra – Light-Mix': {
    label: 'Terra · Light-Mix soil',
    pH: '5.5–6.5',
    products: {
      'Terra Grow': [25, 50, _, _, _, _, _, _, _, _, _],
      'Terra Bloom': [_, _, 50, 50, 50, 40, 45, 50, 50, 50, _],
      'Power Roots': POWER_ROOTS,
      'Pure Zym': PURE_ZYM,
      'Sugar Royal': SUGAR_ROYAL,
      'Power Buds': POWER_BUDS,
      'Green Sensation': GREEN_SENSATION,
    },
    ec: [1.0, 1.6, 1.6, 1.6, 1.6, 1.8, 1.9, 2.0, 2.0, 2.0, _],
  },

  // Pre-fertilised soil (Grow-Mix): no Terra Grow, Terra Bloom starts in week 4.
  'Terra – Grow-Mix': {
    label: 'Terra · Grow-Mix (pre-fertilised) soil',
    pH: '5.5–6.5',
    products: {
      'Terra Bloom': [_, _, _, 50, 50, 40, 45, 50, 50, 50, _],
      'Power Roots': POWER_ROOTS,
      'Pure Zym': PURE_ZYM,
      'Sugar Royal': SUGAR_ROYAL,
      'Power Buds': POWER_BUDS,
      'Green Sensation': GREEN_SENSATION,
    },
    ec: [0.6, 0.6, 0.6, 1.6, 1.6, 1.8, 1.9, 2.0, 2.0, 2.0, _],
  },

  Coco: {
    label: 'Coco · Cocos A + B (hand watering)',
    pH: '5.5–6.5',
    products: {
      'Cocos A': [15, 20, 25, 30, 35, 35, 35, 35, 35, 35, _],
      'Cocos B': [15, 20, 25, 30, 35, 35, 35, 35, 35, 35, _],
      'Power Roots': POWER_ROOTS,
      'Pure Zym': PURE_ZYM,
      'Sugar Royal': SUGAR_ROYAL,
      'Power Buds': POWER_BUDS,
      'Green Sensation': GREEN_SENSATION,
    },
    ec: [1.3, 1.5, 1.7, 1.9, 2.1, 2.5, 2.5, 2.5, 2.5, 2.5, _],
  },

  Hydro: {
    label: 'Hydro · Hydro A + B',
    pH: '5.5–6.5',
    products: {
      'Hydro A': [14, 16, 18, 20, 22, 25, 25, 25, 25, 25, _],
      'Hydro B': [14, 16, 18, 20, 22, 25, 25, 25, 25, 25, _],
      'Hydro Roots': [10, 10, 10, 10, 10, _, _, _, _, _, _],
      'Power Buds': POWER_BUDS,
      'Green Sensation': GREEN_SENSATION,
    },
    ec: [1.4, 1.6, 1.8, 1.9, 2.0, 2.3, 2.3, 2.3, 2.3, 2.3, _],
  },

  'Alga – Bio Light-Mix': {
    label: 'Alga (organic) · Bio Light-Mix',
    pH: '5.5–6.5',
    products: {
      'Alga Grow': [20, 40, _, _, _, _, _, _, _, _, _],
      'Alga Bloom': [_, _, 40, 40, 40, 30, 35, 40, 40, 40, _],
      'Power Roots': POWER_ROOTS,
      'Pure Zym': PURE_ZYM,
      'Sugar Royal': SUGAR_ROYAL,
      'Green Sensation': GREEN_SENSATION,
    },
    // "Use Vita Race once a week as a spray only."
    sprays: { 'Vita Race': [30, 30, 50, 50, 50, _, _, _, _, _, _] },
    ec: null,
  },

  // Richer pre-fertilised soils: no Alga Grow, Alga Bloom starts in week 5.
  'Alga – All-Mix / Royal-Mix / Bat-Mix': {
    label: 'Alga (organic) · All-Mix, Royal-Mix or Bat-Mix',
    pH: '5.5–6.5',
    products: {
      'Alga Bloom': [_, _, _, _, 40, 30, 35, 40, 40, 40, _],
      'Power Roots': POWER_ROOTS,
      'Pure Zym': PURE_ZYM,
      'Sugar Royal': SUGAR_ROYAL,
      'Green Sensation': GREEN_SENSATION,
    },
    sprays: { 'Vita Race': [30, 30, 50, 50, 50, _, _, _, _, _, _] },
    ec: null,
  },
};
