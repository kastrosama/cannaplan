// biobizz.js — BioBizz schedules, transcribed from BioBizz's official charts.
//
// Sources (checked with Kas, 5 Nov 2026):
//   Standard:  biobizz.com/knowledge-base/nutrient-schedule            "The official 2026 chart" (3 Aug 2026)
//   Peat free: biobizz.com/knowledge-base/nutrient-schedule-peat-free  (3 Aug 2026)
//
// Columns (10): Propagation, Veg, Flower wk 1..8. Week 9 = water only, week 10 = harvest.
// Doses are per litre (ml; Microbes in g). null = "not fed this week".
//
// Decisions agreed with Kas (not printed on the charts):
//   - Veg feed: grower chooses Fish·Mix OR Bio·Grow (they do the same job); flowering always Bio·Grow.
//   - Microbes: optional, applied 1x per week (per BioBizz note).
//   - CalMag: chart gives no dose; soft/RO water option shows "follow the label".
//   - pH: soils 6.2–6.5 (BioBizz 2021 chart "ideal"), Coco 5.8–6.3 (general coco guidance).
//   - Autoflowers: app timing (first ~30% veg, last ~10% water only), one fixed flowering mix = chart flower week 4.

const _ = null;

const ROOT_JUICE = [4, 4, 2, 2, _, _, _, _, _, _];
const MICROBES = [0.4, 0.4, 0.2, 0.2, 0.4, 0.4, 0.4, 0.2, 0.2, 0.2];
const ALG_A_MIC = [_, 2, 2, 2, 3, 3, 4, 4, 3, 2];

// Standard: All·Mix
const ALL_MIX = {
  'Root·Juice': ROOT_JUICE,
  'Bio·Grow': [2, 2, 3, 2, 2, 2, 2, 2, 2, 1],
  'Fish·Mix': [2, 2, 3, 2, 2, 2, 2, 2, 2, 1],
  'Bio·Bloom': [_, _, 1, 2, 3, 3, 3, 4, 4, 4],
  'Top·Max': [_, _, 1, 2, 2, 3, 3, 4, 4, 4],
  'Bio·Heaven': [2, 2, 2, 3, 4, 5, 5, 4, 4, 3],
  'Acti·Vera': [2, 2, 3, 4, 5, 5, 3, 3, 2, 1],
};

// Standard: "Light·Mix or Coco·Mix"
const LIGHT_OR_COCO = {
  'Root·Juice': ROOT_JUICE,
  'Bio·Grow': [2, 2, 3, 4, 4, 4, 2, 2, 2, 1],
  'Fish·Mix': [2, 2, 3, 4, 4, 4, 2, 2, 2, 1],
  'Bio·Bloom': [_, _, 2, 3, 3, 4, 4, 4, 3, 3],
  'Top·Max': [_, _, 1, 2, 2, 3, 3, 4, 4, 1], // week 8 = 1 ml as printed (confirmed by Kas)
  'Bio·Heaven': [2, 2, 2, 3, 4, 5, 5, 3, 3, 2],
  'Acti·Vera': [2, 2, 3, 4, 5, 5, 3, 3, 2, 1],
  'Alg·A·Mic': ALG_A_MIC,
};

// Peat free: All·Mix
const ALL_MIX_PF = {
  'Root·Juice': ROOT_JUICE,
  'Bio·Grow': [2, 2, 3, 3, 4, 4, 2, 2, 2, 2],
  'Fish·Mix': [2, 2, 3, 3, 4, 3, 3, 2, 2, 2],
  'Bio·Bloom': [_, _, 3, 4, 4, 4, 4, 3, 3, 2],
  'Top·Max': [_, _, 1, 1, 1, 2, 2, 3, 3, 2],
  'Bio·Heaven': [2, 2, 2, 3, 4, 4, 3, 2, 2, 2],
  'Acti·Vera': [2, 2, 3, 3, 4, 4, 3, 2, 2, 2],
};

// Peat free: Light·Mix
const LIGHT_MIX_PF = {
  'Root·Juice': ROOT_JUICE,
  'Bio·Grow': [2, 2, 3, 3, 4, 4, 4, 3, 3, 2],
  'Fish·Mix': [2, 2, 3, 3, 4, 4, 4, 3, 3, 2],
  'Bio·Bloom': [_, _, 3, 4, 4, 4, 4, 3, 3, 3],
  'Top·Max': [_, _, 1, 1, 1, 2, 2, 3, 3, 2],
  'Bio·Heaven': [2, 2, 2, 3, 4, 4, 3, 2, 2, 2],
  'Acti·Vera': [2, 2, 3, 3, 4, 4, 3, 2, 2, 2],
  'Alg·A·Mic': ALG_A_MIC,
};

const PH_SOIL = '6.2–6.5';
const PH_COCO = '5.8–6.3';

// Keys match growData.soilType (older grows use 'Light-Mix', 'All-Mix', 'Coco').
export const BIOBIZZ_SOILS = {
  'Light-Mix': { label: 'Light·Mix', products: LIGHT_OR_COCO, pH: PH_SOIL },
  'All-Mix': { label: 'All·Mix', products: ALL_MIX, pH: PH_SOIL },
  Coco: { label: 'Coco·Mix', products: LIGHT_OR_COCO, pH: PH_COCO },
  'Light-Mix Peat Free': { label: 'Light·Mix Peat Free', products: LIGHT_MIX_PF, pH: PH_SOIL },
  'All-Mix Peat Free': { label: 'All·Mix Peat Free', products: ALL_MIX_PF, pH: PH_SOIL },
};

export const BIOBIZZ_MICROBES = MICROBES;

const PROP = 0;
const VEG = 1;
const FLOWER = (n) => n + 1; // flower week n (1..8) -> column index
const AUTO_FLOWER_COL = FLOWER(4); // agreed with Kas

function weekMix(soil, col, { vegFeed, flowering, microbes, softWater }) {
  const out = {};
  // In veg the grower's choice of Fish·Mix / Bio·Grow; in flowering always Bio·Grow.
  const feed = flowering ? 'Bio·Grow' : vegFeed === 'Bio·Grow' ? 'Bio·Grow' : 'Fish·Mix';
  if (softWater) out['CalMag'] = 'Follow the label (soft / RO water)';
  for (const [name, doses] of Object.entries(soil.products)) {
    if ((name === 'Bio·Grow' || name === 'Fish·Mix') && name !== feed) continue;
    const v = doses[col];
    if (v != null && v > 0) out[name] = v;
  }
  if (microbes && MICROBES[col] != null) out['Microbes'] = `${MICROBES[col]}g/L (1x per week)`;
  out.pH = soil.pH;
  return out;
}

export function generateBioBizzSchedule(growData) {
  const soil = BIOBIZZ_SOILS[growData.soilType] || BIOBIZZ_SOILS['Light-Mix'];
  const opts = {
    vegFeed: growData.bioBizzVegFeed || 'Fish·Mix',
    microbes: !!growData.bioBizzMicrobes,
    softWater: !!growData.bioBizzSoftWater,
  };
  const n = parseInt(growData.vegWeeks, 10) || 4;
  const weeks = [];
  const add = (phase, col, flowering) =>
    weeks.push({ week: weeks.length + 1, phase, ...(col == null ? { pH: soil.pH } : weekMix(soil, col, { ...opts, flowering })) });

  if (growData.type === 'Autoflower') {
    // App timing (kept by Kas): first ~30% veg, last ~10% water only, the rest flowering.
    for (let i = 1; i <= n; i++) {
      const r = i / n;
      if (r <= 0.3) add(`Vegetative Week ${i}`, i === 1 ? PROP : VEG, false);
      else if (r > 0.9) add('Flush Week', null);
      else add(`Flowering Week ${i}`, AUTO_FLOWER_COL, true);
    }
    return weeks;
  }

  for (let i = 1; i <= n; i++) add(`Vegetative Week ${i}`, i === 1 ? PROP : VEG, false);
  for (let f = 1; f <= 8; f++) add(`Flowering Week ${f}`, FLOWER(f), true);
  add('Flush Week', null); // chart week 9: plain water
  weeks.push({ week: weeks.length + 1, phase: 'Harvest Week' });
  return weeks;
}
