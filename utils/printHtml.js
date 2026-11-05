// printHtml.js — printer-friendly HTML (white paper, black text) for expo-print.
// Built from the schedule data rather than a screenshot, so it prints sharp,
// uses little ink and paginates cleanly on A4/Letter.

import moment from 'moment';
import { getGrowOverview, getMixingRows, getWeekRange, getMediumLabel, parseWater, formatWater, unitWord, unitShort } from './growHelpers';
import { brandName } from './brands';

const PHASE = { veg: '#2F8A48', flower: '#B86E0C', flush: '#2476B0', harvest: '#85603C' };

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');


const page = (title, body) => `<!doctype html>
<html><head><meta charset="utf-8"><title>${esc(title)}</title>
<style>
  @page { margin: 14mm; }
  * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font-family: -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif; color: #14201A; margin: 0; font-size: 11pt; }
  h1 { font-size: 20pt; margin: 0 0 2pt; }
  .sub { color: #5A6B61; font-size: 10pt; margin: 0; }
  .head { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #14201A; padding-bottom: 8pt; margin-bottom: 12pt; }
  .brand { font-weight: 700; letter-spacing: 1.5pt; font-size: 10pt; color: #3F8A2E; }
  .badge { display: inline-block; padding: 2pt 8pt; border-radius: 10pt; font-size: 9pt; font-weight: 700; color: #fff; }
  .meta { display: flex; flex-wrap: wrap; gap: 14pt; margin: 8pt 0 14pt; font-size: 10pt; color: #5A6B61; }
  .meta b { color: #14201A; }
  table { width: 100%; border-collapse: collapse; }
  td, th { padding: 7pt 6pt; border-bottom: 1px solid #DCE4D8; text-align: left; vertical-align: middle; }
  th { font-size: 8.5pt; text-transform: uppercase; letter-spacing: .6pt; color: #5A6B61; border-bottom: 1.5px solid #14201A; }
  .n { width: 22pt; color: #5A6B61; }
  .box { width: 22pt; }
  .box span { display: inline-block; width: 11pt; height: 11pt; border: 1.3px solid #14201A; border-radius: 2pt; }
  .r { text-align: right; white-space: nowrap; }
  .amt { font-size: 13pt; font-weight: 700; }
  .muted { color: #5A6B61; font-size: 9.5pt; }
  .note { margin-top: 12pt; font-size: 9pt; color: #5A6B61; }
  .week { break-inside: avoid; page-break-inside: avoid; margin-bottom: 12pt; border-left: 4pt solid #ccc; padding-left: 8pt; }
  .week h3 { margin: 0 0 4pt; font-size: 12pt; display: flex; justify-content: space-between; align-items: center; }
  .week td { padding: 4pt 6pt; font-size: 10pt; }
  .now { background: #F3F6F1; }
  .foot { margin-top: 16pt; font-size: 8.5pt; color: #94A39A; text-align: center; }
</style></head><body>${body}
<div class="foot">Made with CannaPlan · ${moment().format('D MMM YYYY')} · Always check the manufacturer's label.</div>
</body></html>`;

const header = (grow, title) => `
  <div class="head">
    <div>
      <h1>${esc(title)}</h1>
      <p class="sub">${esc(grow.strain || 'Unnamed grow')}${grow.seedBank ? ` · ${esc(grow.seedBank)}` : ''}</p>
      <p class="sub">${esc([brandName(grow.nutrients), getMediumLabel(grow), grow.type].filter(Boolean).join(' · '))}</p>
    </div>
    <div class="brand">CANNAPLAN</div>
  </div>`;

// One week, as a tick-off mixing checklist.
export function weekPrintHtml(grow, water, units = 'metric') {
  const litres = (w) => formatWater(w, units);
  const o = getGrowOverview(grow);
  const w = o.current;
  const L = isNaN(water) ? parseWater(grow.waterAmount) : water;
  let body = header(grow, w ? `Week ${o.week} feed` : 'Feeding plan');

  if (!w) {
    body += `<p>${o.status === 'upcoming' ? `This grow starts on ${moment(grow.startDate).format('D MMMM YYYY')}.` : 'This grow has finished.'}</p>`;
    return page('CannaPlan', body);
  }

  body += `
    <span class="badge" style="background:${PHASE[w.kind]}">${esc(o.phaseLabel)}</span>
    <div class="meta">
      <span>Day <b>${o.day}</b> · ${esc(getWeekRange(grow.startDate, o.week))}</span>
      ${o.light !== '-' ? `<span>Light <b>${esc(o.light)}</b></span>` : ''}
      <span>Mix for <b>${litres(L)}</b></span>
      <span><b>${o.total}</b> weeks total</span>
    </div>`;

  if (w.kind === 'harvest') {
    body += `<p><b>Harvest week.</b> No feeding: check the trichomes, then harvest, dry and cure.</p>`;
    return page('CannaPlan', body);
  }

  const mix = getMixingRows(w, L, units);
  let n = 1;
  const rows = [];
  rows.push(`<tr><td class="box"><span></span></td><td class="n">${n++}</td><td><b>Fill with ${litres(L)} of water</b><div class="muted">Room temperature, ideally rested</div></td><td class="r"></td></tr>`);
  if (w.kind === 'flush' && !mix.doses.length) {
    rows.push(`<tr><td class="box"><span></span></td><td class="n">${n++}</td><td><b>Water only, no nutrients</b><div class="muted">Flush week</div></td><td class="r"></td></tr>`);
  } else {
    for (const r of mix.doses) {
      rows.push(`<tr><td class="box"><span></span></td><td class="n">${n++}</td><td><b>${esc(r.key)}</b><div class="muted">${r.text ? esc(r.perL) : `${esc(r.perL)} per ${unitWord(units)}`}${r.note ? ` · ${esc(r.note)}` : ''}</div></td><td class="r amt">${esc(r.total)}</td></tr>`);
    }
  }
  for (const r of mix.readings) {
    const title = r.key === 'pH' ? 'Adjust pH' : `Check ${r.label}`;
    const sub = r.key === 'pH' ? 'Always last, after everything is mixed in' : /[–-]/.test(r.perL) ? 'Target range' : 'Target';
    rows.push(`<tr><td class="box"><span></span></td><td class="n">${n++}</td><td><b>${title}</b><div class="muted">${sub}</div></td><td class="r amt">${esc(r.perL)}</td></tr>`);
  }

  body += `<table><thead><tr><th></th><th>#</th><th>Step</th><th class="r">Amount</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;

  if (mix.sprays.length) {
    body += `<p style="margin-top:12pt"><b>Foliar spray (separate bottle):</b> ${mix.sprays
      .map((r) => `${esc(r.key)} ${esc([r.perL, r.note].filter(Boolean).join(' · '))}`)
      .join('; ')}</p>`;
  }
  body += `<p class="note">Mixing order is general guidance. If your bottle label says otherwise, follow the label.</p>`;
  return page('CannaPlan', body);
}

// The whole grow, one compact block per week.
export function schedulePrintHtml(grow, units = 'metric') {
  const litres = (w) => formatWater(w, units);
  const o = getGrowOverview(grow);
  const L = parseWater(grow.waterAmount);
  let body = header(grow, 'Feeding schedule');
  body += `<div class="meta">
      <span>Started <b>${moment(grow.startDate).format('D MMM YYYY')}</b></span>
      <span>Doses for <b>${litres(L)}</b></span>
      <span><b>${o.total}</b> weeks</span>
    </div>`;

  for (const w of o.schedule) {
    const mix = getMixingRows(w, L, units);
    const isNow = w.week === o.week;
    const date = moment(grow.startDate).add(w.week - 1, 'weeks').format('D MMM');
    let rows = '';
    if (w.kind === 'flush' && !mix.doses.length) rows = `<tr><td colspan="3">Water only</td></tr>`;
    else if (w.kind === 'harvest') rows = `<tr><td colspan="3">No feeding · harvest, dry and cure</td></tr>`;
    else
      rows = mix.doses
        .map((r) => `<tr><td>${esc(r.key)}</td><td class="muted r">${r.text ? esc(r.perL) : `${esc(r.perL)}/${unitShort(units)}`}</td><td class="r"><b>${esc(r.total)}</b></td></tr>`)
        .join('');
    rows += mix.sprays
      .map((r) => `<tr><td>${esc(r.key)} <span class="muted">(foliar)</span></td><td class="muted r" colspan="2">${esc([r.perL, r.note].filter(Boolean).join(' · '))}</td></tr>`)
      .join('');
    const readings = mix.readings.map((r) => `${esc(r.label)} <b>${esc(r.perL)}</b>`).join(' &nbsp;·&nbsp; ');

    body += `<div class="week${isNow ? ' now' : ''}" style="border-left-color:${PHASE[w.kind]}">
        <h3><span>Week ${w.week} <span class="muted">· ${date}${w.stage ? ` · ${esc(w.stage)}` : ''}</span></span>
            <span class="badge" style="background:${PHASE[w.kind]}">${esc(w.phase.replace(' Week', ''))}</span></h3>
        <table><tbody>${rows}</tbody></table>
        ${readings ? `<div class="muted" style="margin-top:3pt">${readings}</div>` : ''}
      </div>`;
  }
  return page('CannaPlan', body);
}
