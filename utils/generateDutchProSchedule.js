// generateDutchProSchedule.js

export const generateDutchProSchedule = (growData) => {
  const vegWeeks = parseInt(growData.vegWeeks);
  const totalWeeks = vegWeeks + 8 + 2; // 8 flower + flush + harvest
  const schedule = [];

  const subtype = growData.dutchProSubtype;
  const isHydroCocoRO = subtype === 'Hydro / Coco - RO / Soft Water';
  const isHydroCocoHard = subtype === 'Hydro / Coco - Hard Water';
  const isSoilHard = subtype === 'All-Mix - Hard Water';
  const isSoilRO = subtype === 'All-Mix - RO / Soft Water';
  const isLightMixHard = subtype === 'Light-Mix - Hard Water';
  const isLightMixRO = subtype === 'Light-Mix - RO / Soft Water';

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };

    // Flush Week
    if (i === vegWeeks + 9) {
      weekData.phase = 'Flush Week';
      weekData['Keep It Clean'] = '0.1 ml';
      weekData['pH'] = (isHydroCocoRO || isHydroCocoHard || isLightMixRO) ? '5.8 – 6.2' : '5.8 – 6.5';
      schedule.push(weekData);
      continue;
    }

    // Harvest Week
    if (i === vegWeeks + 10) {
      weekData.phase = 'Harvest Week';
      schedule.push(weekData);
      continue;
    }

    // Vegetation
    if (i === 1) {
      weekData['Silica'] = '0.4 ml';
      weekData['Grow A'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
      weekData['Grow B'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
      weekData['Multi Total'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
      weekData['Take Root'] = '1.0 ml';
    } else if (i <= vegWeeks) {
      weekData['Silica'] = '0.4 ml';
      weekData['Grow A'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
      weekData['Grow B'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
      if (isLightMixHard || isLightMixRO) weekData['Multi Total'] = '1.0 ml';
      weekData['Take Root'] = '1.0 ml';
    } else {
      // Flowering
      const flowerWeek = i - vegWeeks;
      const flowerData = [
        { A: 2.0, B: 2.0, multi: 1, root: 1, explode: 0 },
        { A: 2.5, B: 2.5, multi: '-', root: 1, explode: 0 },
        { A: 2.5, B: 2.5, multi: 1, root: 0, explode: 0.5 },
        { A: 3.0, B: 3.0, multi: '-', root: 0, explode: 0.5 },
        { A: 3.0, B: 3.0, multi: 1, root: 0, explode: 1 },
        { A: 3.5, B: 3.5, multi: '-', root: 0, explode: 1 },
        { A: 4.0, B: 4.0, multi: 1, root: 0, explode: 1.5 },
        { A: 5.0, B: 5.0, multi: '-', root: 0, explode: 1.5 },
      ];
      const f = flowerData[flowerWeek - 1];
      if (f) {
        weekData['Silica'] = '0.4 ml';
        const extra = (isLightMixHard || isLightMixRO) ? 0.5 : 0;
        weekData['Bloom A'] = `${f.A + extra} ml`;
        weekData['Bloom B'] = `${f.B + extra} ml`;
        if (f.multi !== '-') weekData['Multi Total'] = `${f.multi} ml`;
        if (f.root) weekData['Take Root'] = `${f.root} ml`;
        if (f.explode) weekData['Explode'] = `${f.explode} ml`;
      }
    }

    weekData['Amino Strength'] = '0.4 ml (1x per week)';
    if (i <= vegWeeks + 2) weekData['Leaf Green'] = 'Spray 1x per week';
    weekData['CalMag'] = (isLightMixHard || isLightMixRO) ? '0.5 – 0.8 ml' : '0.1 – 1 ml';
    weekData['Keep It Clean'] = '0.1 ml';

    // pH Logic
    if (isHydroCocoRO || isHydroCocoHard || isLightMixRO) {
      weekData['pH'] = '5.8 – 6.2';
    } else {
      weekData['pH'] = '5.8 – 6.5';
    }

    // EC Logic
    if (i <= vegWeeks) {
      weekData['EC'] = '1.8 – 2.0';
    } else if (i <= vegWeeks + 8) {
      weekData['EC'] = isSoilHard ? '1.8 – 2.3' : '1.8 – 2.4';
    }

    schedule.push(weekData);
  }

  return schedule;
};
