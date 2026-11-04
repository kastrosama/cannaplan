// generateDutchProSchedule.js
export const generateDutchProSchedule = (growData) => {
  const { type, vegWeeks, dutchProSubtype } = growData;
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // auto: total duration, photo: veg + flower + flush + harvest
  const schedule = [];
  const subtype = dutchProSubtype;
  const isHydroCocoRO = subtype === 'Hydro / Coco - RO / Soft Water';
  const isHydroCocoHard = subtype === 'Hydro / Coco - Hard Water';
  const isSoilHard = subtype === 'All-Mix - Hard Water';
  const isSoilRO = subtype === 'All-Mix - RO / Soft Water';
  const isLightMixHard = subtype === 'Light-Mix - Hard Water';
  const isLightMixRO = subtype === 'Light-Mix - RO / Soft Water';

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };

    if (isAuto) {
      // Autoflower logic
      const progressRatio = i / totalWeeks;
      const isVeg = progressRatio <= 0.6;
      const isFlower = progressRatio > 0.6 && progressRatio <= 0.95;
      const isFlush = progressRatio > 0.95;

      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['Keep It Clean'] = '0.1 ml';
        weekData['pH'] = (isHydroCocoRO || isHydroCocoHard || isLightMixRO) ? '5.8 – 6.2' : '5.8 – 6.5';
      } else if (isVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          weekData['Silica'] = '0.4 ml';
          weekData['Grow A'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Grow B'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Multi Total'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Take Root'] = '1.0 ml';
        } else {
          weekData['Silica'] = '0.4 ml';
          weekData['Grow A'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
          weekData['Grow B'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
          if (isLightMixHard || isLightMixRO) weekData['Multi Total'] = '1.0 ml';
          weekData['Take Root'] = '1.0 ml';
        }
        addCommonNutrients(weekData, isLightMixHard, isLightMixRO, isHydroCocoRO, isHydroCocoHard, isSoilHard, true);
      } else {
        // Flowering for autoflowers
        weekData.phase = `Flowering Week ${i}`;
        weekData['Silica'] = '0.4 ml';
        weekData['Bloom A'] = '3.0 ml';
        weekData['Bloom B'] = '3.0 ml';
        weekData['Multi Total'] = '1.0 ml';
        weekData['Explode'] = '1.0 ml';
        addCommonNutrients(weekData, isLightMixHard, isLightMixRO, isHydroCocoRO, isHydroCocoHard, isSoilHard, false);
      }
    } else {
      // Photoperiod logic (existing code with phase labels added)
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;

      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['Keep It Clean'] = '0.1 ml';
        weekData['pH'] = (isHydroCocoRO || isHydroCocoHard || isLightMixRO) ? '5.8 – 6.2' : '5.8 – 6.5';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';
      } else if (isVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          weekData['Silica'] = '0.4 ml';
          weekData['Grow A'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Grow B'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Multi Total'] = isLightMixHard || isLightMixRO ? '2.5 ml' : '2.0 ml';
          weekData['Take Root'] = '1.0 ml';
        } else {
          weekData['Silica'] = '0.4 ml';
          weekData['Grow A'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
          weekData['Grow B'] = isLightMixHard || isLightMixRO ? '3.0 ml' : '2.5 ml';
          if (isLightMixHard || isLightMixRO) weekData['Multi Total'] = '1.0 ml';
          weekData['Take Root'] = '1.0 ml';
        }
        addCommonNutrients(weekData, isLightMixHard, isLightMixRO, isHydroCocoRO, isHydroCocoHard, isSoilHard, true);
      } else if (isFlower) {
        const flowerWeek = i - vegDuration;
        weekData.phase = `Flowering Week ${flowerWeek}`;
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
        addCommonNutrients(weekData, isLightMixHard, isLightMixRO, isHydroCocoRO, isHydroCocoHard, isSoilHard, false);
      }
    }

    schedule.push(weekData);
  }

  return schedule;
};

// Helper function to add common nutrients
function addCommonNutrients(weekData, isLightMixHard, isLightMixRO, isHydroCocoRO, isHydroCocoHard, isSoilHard, isVeg) {
  weekData['Amino Strength'] = '0.4 ml (1x per week)';
  if (isVeg || weekData.phase.includes('Flowering Week 1') || weekData.phase.includes('Flowering Week 2')) {
    weekData['Leaf Green'] = 'Spray 1x per week';
  }
  weekData['CalMag'] = (isLightMixHard || isLightMixRO) ? '0.5 – 0.8 ml' : '0.1 – 1 ml';
  weekData['Keep It Clean'] = '0.1 ml';
  
  // pH Logic
  if (isHydroCocoRO || isHydroCocoHard || isLightMixRO) {
    weekData['pH'] = '5.8 – 6.2';
  } else {
    weekData['pH'] = '5.8 – 6.5';
  }
  
  // EC Logic
  if (isVeg) {
    weekData['EC'] = '1.8 – 2.0';
  } else if (weekData.phase.includes('Flowering')) {
    weekData['EC'] = isSoilHard ? '1.8 – 2.3' : '1.8 – 2.4';
  }
}