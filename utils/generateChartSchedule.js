// generateChartSchedule.js — one engine for data-driven brand charts.
//
// A chart line looks like:
//   { pH, products: { name: [per-10-L doses x 11] }, sprays?: {...}, ec?: [x 11] }
// Week layout of the source chart: indexes 0-1 grow, 2-9 bloom, 10 only water.
//
// Mapping to a grow:
//   Photoperiod: veg N weeks (week 1 = chart wk 1, rest = chart wk 2, as the charts
//   advise), 8 flower weeks (chart wk 3-10), flush (chart wk 11), harvest.
//   Autoflower (total T weeks): ~30% veg, flower compressed onto the 8 bloom
//   weeks, final week flush.

const GROW = [0, 1];
const BLOOM = [2, 3, 4, 5, 6, 7, 8, 9];
const PER = 10; // chart doses are per 10 litres

const perLitre = (v) => Math.round((v / PER) * 100) / 100;

function weekFromChart(line, idx) {
  const out = {};
  for (const [name, doses] of Object.entries(line.products)) {
    const v = doses[idx];
    if (v != null && v > 0) out[name] = perLitre(v);
  }
  for (const [name, doses] of Object.entries(line.sprays || {})) {
    const v = doses[idx];
    if (v != null && v > 0) out[name] = `${perLitre(v)}ml/L spray (1x per week)`;
  }
  if (line.ec && line.ec[idx] != null) out.EC = line.ec[idx].toFixed(1);
  if (line.pH) out.pH = line.pH;
  return out;
}

export function generateChartSchedule(line, growData) {
  if (!line) return [];
  const isAuto = growData.type === 'Autoflower';
  const n = parseInt(growData.vegWeeks, 10) || 4;
  const weeks = [];
  const push = (phase, idx) => weeks.push({ week: weeks.length + 1, phase, ...(idx == null ? {} : weekFromChart(line, idx)) });
  const flush = () => weeks.push({ week: weeks.length + 1, phase: 'Flush Week', Water: 'Only', ...(line.pH ? { pH: line.pH } : {}) });

  if (isAuto) {
    const total = n;
    const veg = Math.max(2, Math.round(total * 0.3));
    const flower = total - veg - 1;
    for (let i = 0; i < veg; i++) push(`Vegetative Week ${i + 1}`, GROW[Math.min(i, 1)]);
    for (let j = 0; j < flower; j++) push(`Flowering Week ${j + 1}`, BLOOM[Math.floor((j * BLOOM.length) / flower)]);
    flush();
    return weeks;
  }

  for (let i = 0; i < n; i++) push(`Vegetative Week ${i + 1}`, GROW[Math.min(i, 1)]);
  BLOOM.forEach((idx, j) => push(`Flowering Week ${j + 1}`, idx));
  flush();
  weeks.push({ week: weeks.length + 1, phase: 'Harvest Week' });
  return weeks;
}
