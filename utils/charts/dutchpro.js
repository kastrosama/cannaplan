// dutchpro.js — Dutch Pro feed charts, transcribed from the official charts.
//
// Source: Dutchpro USA feed charts (dutchprousa.com/feed-charts, PDFs uploaded 2022/10),
// "FEED CHART ... Per 1 L water WITHOUT EXTRA CO2". Read from screenshots Kas sent, 5 Nov 2026:
//   Soil Hard Water · Soil RO/SO Soft Water · Hydro/Coco Hard Water · Hydro/Coco RO/SO Soft Water
//
// Columns (11): Veg wk 1, Veg wk 2, Bloom wk 1..8, Flush. Per litre. null = empty cell.
// Base feed is EC-led on the charts: "Always use equal amounts of A & B base feed!
// Keep adding base nutrients until you reach your EC" — shown as min–max with that hint.
//
// Decisions agreed with Kas (not printed on the charts):
//   - Veg longer than 2 weeks repeats chart week 2.
//   - Autoflowers: ~30% veg, the 8 bloom weeks spread over the flowering time, last week flush.
//   - Flush week exactly as charted: Keep It Clean 0.1 ml, no pH.

const _ = null;

// Identical on all four charts
const COMMON = {
  Silica: [0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4, _],
  'Multi Total': [2, _, 1, _, 1, _, 1, _, 1, _, _], // veg wk 1 "Watering 2 ml"
  'Take Root': [1, 1, 1, 1, _, _, _, _, _, _, _],
  Explode: [_, _, _, _, 0.5, 0.5, 1, 1, 1.5, 1.5, _],
  // Optional environmental supplements
  'Amino Strength': Array(10).fill('0.4 ml (1x per week)').concat([_]),
  CalMag: Array(10).fill('0.1 – 1 ml').concat([_]),
  'Leaf Green': ['Spray 1x per week', 'Spray 1x per week', 'Spray 1x per week', 'Spray 1x per week', _, _, _, _, _, _, _],
  'Keep It Clean': Array(11).fill(0.1),
};

// Base feed per chart: [min, max] ml each of A and B, with EC target
const CHARTS = {
  'Soil - Hard Water': {
    label: 'Soil · Hard water',
    grow: { min: 2.5, max: 5.0, ec: '1.5–2.0' },
    bloom: { min: 2.5, max: 5.0, ec: '1.8–2.3' },
    pH: '5.8–6.5',
  },
  'Soil - RO / Soft Water': {
    label: 'Soil · RO / soft water',
    grow: { min: 1.5, max: 3.0, ec: '1.5–2.0' },
    bloom: { min: 2.0, max: 3.0, ec: '1.8–2.4' },
    pH: '5.8–6.5',
  },
  'Hydro / Coco - Hard Water': {
    label: 'Hydro / Coco · Hard water',
    grow: { min: 2.5, max: 3.5, ec: '1.8–2.0' },
    bloom: { min: 2.5, max: 3.5, ec: '1.8–2.4' },
    pH: '5.8–6.2',
  },
  'Hydro / Coco - RO / Soft Water': {
    label: 'Hydro / Coco · RO / soft water',
    grow: { min: 2.0, max: 3.0, ec: '1.8–2.2' },
    bloom: { min: 2.0, max: 3.0, ec: '1.8–2.4' },
    pH: '5.8–6.2',
  },
};

export const DUTCHPRO_OPTIONS = Object.keys(CHARTS);

// Older grows used six options; Light-Mix and All-Mix both use the Soil chart.
const LEGACY = {
  'All-Mix - Hard Water': 'Soil - Hard Water',
  'Light-Mix - Hard Water': 'Soil - Hard Water',
  'All-Mix - RO / Soft Water': 'Soil - RO / Soft Water',
  'Light-Mix - RO / Soft Water': 'Soil - RO / Soft Water',
};
export const normalizeDutchProSubtype = (s) => LEGACY[s] || s;

const base = ({ min, max, ec }) => ({ min, max, unit: 'ml', hint: `start low, add until EC ${ec}` });

function column(chart, col) {
  const out = {};
  const isVeg = col <= 1;
  const isBloom = col >= 2 && col <= 9;
  if (isVeg) {
    out['Grow A'] = base(chart.grow);
    out['Grow B'] = base(chart.grow);
  }
  if (isBloom) {
    out['Bloom A'] = base(chart.bloom);
    out['Bloom B'] = base(chart.bloom);
  }
  for (const [name, vals] of Object.entries(COMMON)) {
    const v = vals[col];
    if (v != null) out[name] = v;
  }
  if (isVeg) out.EC = chart.grow.ec;
  if (isBloom) out.EC = chart.bloom.ec;
  if (isVeg || isBloom) out.pH = chart.pH; // flush: no pH, as charted
  return out;
}

const FLUSH = 10;

export function generateDutchProSchedule(growData) {
  const chart = CHARTS[normalizeDutchProSubtype(growData.dutchProSubtype)] || CHARTS['Soil - Hard Water'];
  const n = parseInt(growData.vegWeeks, 10) || 4;
  const weeks = [];
  const add = (phase, col) => weeks.push({ week: weeks.length + 1, phase, ...column(chart, col) });

  if (growData.type === 'Autoflower') {
    const veg = Math.max(2, Math.round(n * 0.3));
    const flower = n - veg - 1;
    for (let i = 0; i < veg; i++) add(`Vegetative Week ${i + 1}`, Math.min(i, 1));
    for (let j = 0; j < flower; j++) add(`Flowering Week ${j + 1}`, 2 + Math.floor((j * 8) / flower));
    add('Flush Week', FLUSH);
    return weeks;
  }

  for (let i = 0; i < n; i++) add(`Vegetative Week ${i + 1}`, Math.min(i, 1)); // week 3+ repeats week 2
  for (let b = 0; b < 8; b++) add(`Flowering Week ${b + 1}`, 2 + b);
  add('Flush Week', FLUSH);
  weeks.push({ week: weeks.length + 1, phase: 'Harvest Week' });
  return weeks;
}
