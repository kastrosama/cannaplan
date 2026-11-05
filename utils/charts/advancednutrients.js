// advancednutrients.js — Advanced Nutrients schedules from the official feed charts.
//
// Source: advancednutrients.com/feeding (official PDFs, read 5 Nov 2026 with Kas):
//   pH Perfect Sensi Grow & Bloom (GLOBAL, 2022 / mod 2023)        Top Shelf + Master
//   pH Perfect Sensi Coco Grow & Bloom (GLOBAL, Aug 2023)           Top Shelf + Master
//   pH Perfect Connoisseur Grow & Bloom (GLOBAL, mod Aug 2023)      Top Shelf + Master
//   pH Perfect Grow Micro Bloom (GLOBAL, mod Aug 2023)              Top Shelf + Master
//   OG Organics Iguana Juice (GLOBAL, Apr 2023)                     single recipe
//   Jungle Juice Grow Micro Bloom (Top Shelf Outdoor, Jun 2021)     by season, mL per US gallon
//   Sensi Terra Part One / Part Two (EU 2023, German)               ranges
//   Starter Kit (EU, May 2023, German)                              single recipe (Sensi base)
//   pH Perfect Connoisseur Coco — official links broken; waiting for Kas's screenshots.
//
// pH Perfect chart layout: GROW wk 1–4, BLOOM wk 1–8 where bloom wk 8 is the
// nutrient-free flush period (Flawless Finish only). Doses in ml/L. No pH/EC (pH Perfect).
//
// Decisions agreed with Kas:
//   - Photoperiod bloom = 8 feed weeks: chart wk 1,2,3,4,4,5,6,7 (AN tip: "repeat week 4 if
//     your crop runs longer"), then chart wk 8 as the flush week, then harvest.
//   - Veg longer than 4 weeks repeats week 4 (AN tip). Week 1 = chart week 1.
//   - Autoflowers like Plagron/Dutch Pro: ~30% veg, bloom feed weeks spread over the
//     flowering time, last week = chart flush week.
//   - Jungle Juice: season names shown; veg stretches/shrinks Late Veg.
//   - Sensi Terra ranges shown as charted; Voodoo Juice Plus "once a week, follow the label".
//   - OG Organics Sensi Cal-Mag Xtra: foliar, only at the first sign of deficiency.

const _ = null;
const X = (n, v) => Array(n).fill(v);

// ---------- pH Perfect lines (Sensi, Sensi Coco, Connoisseur, GMB) ----------
// Each product: { g: [4 grow weeks], b: [8 bloom weeks] }
const BASE_2PART = (grow, bloom) => ({
  [`${grow} A`]: { g: [1, 2, 3, 4], b: X(8, _) },
  [`${grow} B`]: { g: [1, 2, 3, 4], b: X(8, _) },
  [`${bloom} A`]: { g: X(4, _), b: [...X(7, 4), _] },
  [`${bloom} B`]: { g: X(4, _), b: [...X(7, 4), _] },
});
const BASE_GMB = {
  Grow: { g: [1, 2, 3, 4], b: [...X(7, 4), _] },
  Micro: { g: [1, 2, 3, 4], b: [...X(7, 4), _] },
  Bloom: { g: [1, 2, 3, 4], b: [...X(7, 4), _] },
};

const topShelf = (bigBud = 'Big Bud') => ({
  'Voodoo Juice': { g: [2, 2, _, _], b: [2, 2, _, _, _, _, _, _] },
  'B-52': { g: [2, 2, 2, 2], b: [_, _, 2, 2, 2, 2, 2, _] },
  'Bud Ignitor': { g: X(4, _), b: [2, 2, _, _, _, _, _, _] },
  [bigBud]: { g: X(4, _), b: [_, 2, 2, 2, 2, _, _, _] },
  'Bud Candy': { g: X(4, _), b: [...X(7, 2), _] },
  Overdrive: { g: X(4, _), b: [_, _, _, _, _, 2, 2, _] },
  'Flawless Finish': { g: X(4, _), b: [_, _, _, _, _, _, _, 2] },
});
const masterExtras = {
  Tarantula: { g: [2, 2, _, _], b: [2, 2, _, _, _, _, _, _] },
  Piranha: { g: [2, 2, _, _], b: [2, 2, _, _, _, _, _, _] },
  'Rhino Skin': { g: [2, 2, 2, 2], b: [...X(7, 2), _] },
  Sensizym: { g: [2, 2, 2, 2], b: [...X(7, 2), _] },
  'Bud Factor X': { g: X(4, _), b: [...X(7, 2), _] },
  'Tasty Terpenes': { g: X(4, _), b: [_, _, 2, 2, 2, 2, 2, _] },
};
const master = (bigBud) => {
  const ts = topShelf(bigBud);
  // Master also feeds Bud Candy through the grow weeks
  return { ...ts, ...masterExtras, 'Bud Candy': { g: [2, 2, 2, 2], b: ts['Bud Candy'].b } };
};

const phPerfect = (base, bigBud) => ({ recipes: { 'Top Shelf': { ...base, ...topShelf(bigBud) }, Master: { ...base, ...master(bigBud) } } });

// ---------- single-recipe lines ----------
const STARTER_KIT = {
  ...BASE_2PART('Sensi Grow', 'Sensi Bloom'),
  'Voodoo Juice': { g: [2, 2, _, _], b: [2, 2, _, _, _, _, _, _] },
  'B-52': { g: [2, 2, 2, 2], b: [_, _, 2, 2, 2, 2, 2, _] },
  'Big Bud': { g: X(4, _), b: [_, 2, 2, 2, 2, _, _, _] },
  Overdrive: { g: X(4, _), b: [_, _, _, _, _, 2, 2, _] },
  'Bud Candy': { g: X(4, _), b: [...X(7, 2), _] },
};

const CALMAG_XTRA = '0.5 ml/L spray (only at the first sign of Ca/Mg deficiency)'; // chart: 2 mL/gal
const OG_ORGANICS = {
  'Iguana Juice Grow': { g: [1, 2, 3, 4], b: X(8, _) },
  'Iguana Juice Bloom': { g: X(4, _), b: [...X(7, 4), _] },
  'Ancient Earth': { g: X(4, 2), b: [...X(7, 2), _] },
  'Bud Candy': { g: X(4, 2), b: [...X(7, 2), _] },
  "Grandma Enggy's": { g: X(4, 2), b: X(8, _) },
  "Grandma Enggy's F1": { g: X(4, _), b: [...X(7, 2), _] },
  "Bigmike's OG Tea": { g: X(4, _), b: [...X(7, 2), _] },
  'Big Bud': { g: X(4, _), b: [_, 2, 2, 2, 2, 2, 2, _] },
  'Tasty Terpenes': { g: X(4, _), b: [_, _, 2, 2, 2, 2, 2, _] },
  'Sensi Cal-Mag Xtra': { g: X(4, CALMAG_XTRA), b: [...X(7, CALMAG_XTRA), _] },
};

// Sensi Terra: grow columns = [rooting, veg 1–3, veg 4]; bloom wk 1–8 (8 = flush)
const r = (min, max) => ({ min, max, unit: 'ml', hint: 'start low, increase if the plant needs it' });
const VJP = 'Once a week, follow the label';
const SENSI_TERRA = {
  'Sensi Terra Part One': { g: [r(1, 3.5), r(3, 5.5), r(5, 7)], b: [r(5, 7), r(5, 7), _, _, _, _, _, _] },
  'Sensi Terra Part Two': { g: X(3, _), b: [_, _, r(5, 7), r(5, 7), r(5, 7), r(4, 6), r(4, 6), _] },
  'Voodoo Juice Plus': { g: X(3, VJP), b: [...X(7, VJP), _] },
  Sensizym: { g: [_, 2, 2], b: [...X(7, 2), _] },
  'B-52': { g: [_, 2, 2], b: [...X(7, 2), _] },
  Hammerhead: { g: X(3, _), b: [_, _, 2, 2, 2, 2, 2, _] },
};

// Jungle Juice: by season, chart in mL per US gallon -> ml/L (0.1 ml)
const G = (mlPerGal) => Math.round((mlPerGal / 3.78541) * 1000) / 1000; // shown rounded; kept precise so US gallons give the chart value back
const SEASONS = ['Cuttings & Seedlings', 'Early Veg', 'Late Veg', 'Transition to Bloom', 'Early Bloom', 'Mid Bloom', 'Late Bloom', 'Flush'];
const JJ = {
  Grow: [2, 5, 6.5, 7, 5, 5, 4, _],
  Micro: [2, 5.5, 7, 7, 7, 7, 5, _],
  Bloom: [2, 4, 5, 7, 6.5, 8, 6, _],
  'Voodoo Juice': [8, 8, _, _, 8, _, _, _],
  'B-52': [8, 8, 8, 8, 8, 8, 8, _],
  'Rhino Skin': [_, _, 8, 8, 8, 8, 8, _],
  'Big Bud': [_, _, _, _, 8, 8, _, _],
  Overdrive: [_, _, _, _, _, _, 8, _],
  'Bud Candy': [8, 8, 8, 8, 8, 8, 8, _],
  'Flawless Finish': [_, _, _, _, _, _, _, 8],
};
const JJ_BUD_BLOOD_TRANSITION = `${Math.round((2 / 3.785) * 100) / 100}g/L (optional)`; // chart: 2 g/Gal

// ---------- line registry ----------
export const AN_LINES = {
  'pH Perfect Sensi Grow/Bloom': phPerfect(BASE_2PART('Sensi Grow', 'Sensi Bloom'), 'Big Bud'),
  'pH Perfect Sensi Coco Grow/Bloom': phPerfect(BASE_2PART('Sensi Coco Grow', 'Sensi Coco Bloom'), 'Big Bud Coco'),
  'pH Perfect Connoisseur Grow/Bloom': phPerfect(BASE_2PART('Connoisseur Grow', 'Connoisseur Bloom'), 'Big Bud'),
  'pH Perfect Grow Micro Bloom': phPerfect(BASE_GMB, 'Big Bud'),
  'Starter Kit': { recipes: { Standard: STARTER_KIT } },
  'OG Organics (Iguana Juice)': { recipes: { Standard: OG_ORGANICS } },
  'Sensi Terra': { recipes: { Standard: SENSI_TERRA }, terra: true },
  'Jungle Juice': { jungle: true },
};

export const anRecipesFor = (line) => Object.keys(AN_LINES[line]?.recipes || {});

// ---------- schedule building ----------
const BLOOM_FEED_COLS = [0, 1, 2, 3, 3, 4, 5, 6]; // repeat week 4 (agreed)
const FLUSH_COL = 7;

function mix(products, phaseKey, col) {
  const out = {};
  for (const [name, p] of Object.entries(products)) {
    const v = p[phaseKey][col];
    if (v != null && v !== 0) out[name] = v;
  }
  return out;
}

const terraStage = (line, col) => (line.terra && col === 0 ? { stage: 'Rooting / cloning' } : {});
const spread = (j, len, cols) => Math.min(cols - 1, Math.floor((j * cols) / len));

function chartSchedule(line, products, growData) {
  const n = parseInt(growData.vegWeeks, 10) || 4;
  const growCols = line.terra ? 3 : 4;
  const weeks = [];
  const push = (phase, extra) => weeks.push({ week: weeks.length + 1, phase, ...extra });
  // Veg column for veg week i (0-based) of v veg weeks
  const vegCol = (i, v) => {
    if (line.terra) return i === 0 ? 0 : i === v - 1 ? 2 : 1; // rooting, veg 1–3, last veg week = veg 4
    return Math.min(i, growCols - 1); // repeat week 4
  };

  if (growData.type === 'Autoflower') {
    const veg = Math.max(2, Math.round(n * 0.3));
    const flower = n - veg - 1;
    for (let i = 0; i < veg; i++) {
      const col = vegCol(i, veg); // chart order from week 1, like Plagron / Dutch Pro
      push(`Vegetative Week ${i + 1}`, { ...mix(products, 'g', col), ...terraStage(line, col) });
    }
    for (let j = 0; j < flower; j++) push(`Flowering Week ${j + 1}`, mix(products, 'b', spread(j, flower, 7)));
    push('Flush Week', mix(products, 'b', FLUSH_COL));
    return weeks;
  }

  for (let i = 0; i < n; i++) push(`Vegetative Week ${i + 1}`, { ...mix(products, 'g', vegCol(i, n)), ...terraStage(line, vegCol(i, n)) });
  BLOOM_FEED_COLS.forEach((col, j) => push(`Flowering Week ${j + 1}`, mix(products, 'b', col)));
  push('Flush Week', mix(products, 'b', FLUSH_COL));
  weeks.push({ week: weeks.length + 1, phase: 'Harvest Week' });
  return weeks;
}

function jungleWeek(season) {
  const out = {};
  for (const [name, vals] of Object.entries(JJ)) if (vals[season] != null) out[name] = G(vals[season]);
  if (season === 3) out['Bud Blood'] = JJ_BUD_BLOOD_TRANSITION;
  return season === 7 ? out : { ...out, stage: SEASONS[season] };
}

// Veg seasons for v veg weeks: stretch/shrink Late Veg (agreed)
const jungleVegSeasons = (v) =>
  v <= 1 ? [0] : v === 2 ? [0, 3] : v === 3 ? [0, 1, 3] : [0, 1, ...Array(v - 3).fill(2), 3];
const jungleBloomSeason = (j, f) => (j < (f * 3) / 8 ? 4 : j < (f * 6) / 8 ? 5 : 6);

function jungleSchedule(growData) {
  const n = parseInt(growData.vegWeeks, 10) || 4;
  const weeks = [];
  const push = (phase, extra) => weeks.push({ week: weeks.length + 1, phase, ...extra });
  const isAuto = growData.type === 'Autoflower';
  const veg = isAuto ? Math.max(2, Math.round(n * 0.3)) : n;
  const flower = isAuto ? n - veg - 1 : 8;
  jungleVegSeasons(veg).forEach((s, i) => push(`Vegetative Week ${i + 1}`, jungleWeek(s)));
  for (let j = 0; j < flower; j++) push(`Flowering Week ${j + 1}`, jungleWeek(jungleBloomSeason(j, flower)));
  push('Flush Week', jungleWeek(7));
  if (!isAuto) weeks.push({ week: weeks.length + 1, phase: 'Harvest Week' });
  return weeks;
}

export function generateAdvancedNutrientsSchedule(growData) {
  const line = AN_LINES[growData.advancedNutrientsLine];
  if (!line) return [];
  if (line.jungle) return jungleSchedule(growData);
  const recipes = Object.keys(line.recipes);
  const recipe = recipes.includes(growData.advancedNutrientsRecipe) ? growData.advancedNutrientsRecipe : recipes[0];
  return chartSchedule(line, line.recipes[recipe], growData);
}
