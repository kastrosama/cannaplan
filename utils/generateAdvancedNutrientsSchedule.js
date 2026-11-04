// generateAdvancedNutrientsSchedule.js

export const generateAdvancedNutrientsSchedule = (lineName, vegWeeks = 4, type = 'Feminized') => {
  const schedule = [];
  const isAuto = type === 'Autoflower';
  const vegDuration = parseInt(vegWeeks);
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2;

  const isJungleJuice = lineName === 'Jungle Juice';
  const isOGOrganics = lineName.includes('OG Organics');
  const isSensiCoco = lineName.includes('Sensi Coco');
  const isSensi = lineName === 'pH Perfect Sensi Grow/Bloom';
  const isConnoisseur = lineName.includes('Connoisseur');
  const isGrowMicroBloom = lineName === 'pH Perfect Grow Micro Bloom';

  // 1 US gallon = 3.785 L. Round to 0.1 ml/L (Math.ceil used to overdose by up to 2x).
  const convert = (mlPerGal) => Math.round((mlPerGal / 3.785) * 10) / 10;

  const addWeek = (weekNum, nutrients, phase) => {
    schedule.push({ week: weekNum, phase: phase, ...nutrients });
  };

  const flushWeek = (weekNum) => {
    addWeek(weekNum, { Water: 'Only' }, 'Flush Week');
  };

  const harvestWeek = (weekNum) => {
    addWeek(weekNum, {}, 'Harvest Week');
  };

  if (isOGOrganics) {
    const veg = [
      { "Iguana Juice Grow": '1ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Grandma Enggy's": '2ml/L', "Sensizym": '2ml/L', "Sensi Cal Mag Xtra": '0.5ml/L spray (1x)' },
      { "Iguana Juice Grow": '2ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Grandma Enggy's": '2ml/L', "Sensizym": '2ml/L', "Sensi Cal Mag Xtra": '0.5ml/L spray (1x)' },
      { "Iguana Juice Grow": '3ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Grandma Enggy's": '2ml/L', "Sensizym": '2ml/L', "Sensi Cal Mag Xtra": '0.5ml/L spray (1x)' },
      { "Iguana Juice Grow": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Grandma Enggy's": '2ml/L', "Sensizym": '2ml/L', "Sensi Cal Mag Xtra": '0.5ml/L spray (1x)' },
    ];
    const flower = [
      { "Iguana Juice Bloom": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Bigmikes OG Tea": '2ml/L', "Grandma Enggy's F1": '2ml/L', "Sensizym": '2ml/L', "Big Bud": '0ml/L', "Nirvana": '0ml/L', "Sensi CalMag Xtra": '0.5ml/L spray (1x)' },
      { "Iguana Juice Bloom": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Bigmikes OG Tea": '2ml/L', "Grandma Enggy's F1": '2ml/L', "Sensizym": '2ml/L', "Big Bud": '2ml/L', "Nirvana": '0ml/L', "Sensi CalMag Xtra": '0.5ml/L spray (1x)' },
    ];

    if (isAuto) {
      // Autoflower logic
      for (let i = 1; i <= totalWeeks; i++) {
        const progressRatio = i / totalWeeks;
        if (progressRatio > 0.95) {
          flushWeek(i);
        } else if (progressRatio <= 0.6) {
          const vegIndex = Math.min(i - 1, veg.length - 1);
          addWeek(i, veg[vegIndex], `Vegetative Week ${i}`);
        } else {
          const flowerIndex = Math.min(Math.floor((progressRatio - 0.6) * flower.length * 2.5), flower.length - 1);
          const base = flowerIndex < flower.length ? flower[flowerIndex] : { "Iguana Juice Bloom": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Bigmikes OG Tea": '2ml/L', "Grandma Enggy's F1": '2ml/L', "Sensizym": '2ml/L', "Big Bud": '2ml/L', "Nirvana": '2ml/L', "Sensi CalMag Xtra": '0.5ml/L spray (1x)' };
          addWeek(i, base, `Flowering Week ${i}`);
        }
      }
    } else {
      // Photoperiod logic
      for (let i = 0; i < vegDuration; i++) addWeek(i + 1, veg[Math.min(i, veg.length - 1)], `Vegetative Week ${i + 1}`);
      for (let i = 0; i < 8; i++) {
        const base = i < flower.length ? flower[i] : { "Iguana Juice Bloom": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Bigmikes OG Tea": '2ml/L', "Grandma Enggy's F1": '2ml/L', "Sensizym": '2ml/L', "Big Bud": '2ml/L', "Nirvana": '2ml/L', "Sensi CalMag Xtra": '0.5ml/L spray (1x)' };
        addWeek(vegDuration + i + 1, base, `Flowering Week ${i + 1}`);
      }
      flushWeek(vegDuration + 9);
      harvestWeek(vegDuration + 10);
    }
    return schedule;
  }

  const generateStandard = (prefixGrow, prefixBloom) => {
    const veg = [
      { [`${prefixGrow} A`]: '1ml/L', [`${prefixGrow} B`]: '1ml/L', 'B-52': '2ml/L', 'Voodoo Juice': '2ml/L' },
      { [`${prefixGrow} A`]: '2ml/L', [`${prefixGrow} B`]: '2ml/L', 'B-52': '2ml/L', 'Voodoo Juice': '2ml/L' },
      { [`${prefixGrow} A`]: '3ml/L', [`${prefixGrow} B`]: '3ml/L', 'B-52': '2ml/L', 'Voodoo Juice': '0ml/L' },
      { [`${prefixGrow} A`]: '4ml/L', [`${prefixGrow} B`]: '4ml/L', 'B-52': '2ml/L', 'Voodoo Juice': '0ml/L' },
    ];
    const flower = [
      { [`${prefixBloom} A`]: '4ml/L', [`${prefixBloom} B`]: '4ml/L', 'B-52': '0ml/L', 'Voodoo Juice': '2ml/L', 'Bud Ignitor': '2ml/L', 'Big Bud': '0ml/L', 'Overdrive': '0ml/L', 'Bud Candy': '2ml/L', 'Flawless Finish': '0ml/L' },
      { [`${prefixBloom} A`]: '4ml/L', [`${prefixBloom} B`]: '4ml/L', 'B-52': '0ml/L', 'Voodoo Juice': '2ml/L', 'Bud Ignitor': '2ml/L', 'Big Bud': '2ml/L', 'Overdrive': '0ml/L', 'Bud Candy': '2ml/L', 'Flawless Finish': '0ml/L' },
    ];

    if (isAuto) {
      // Autoflower logic
      for (let i = 1; i <= totalWeeks; i++) {
        const progressRatio = i / totalWeeks;
        if (progressRatio > 0.95) {
          flushWeek(i);
        } else if (progressRatio <= 0.6) {
          const vegIndex = Math.min(i - 1, veg.length - 1);
          addWeek(i, veg[vegIndex], `Vegetative Week ${i}`);
        } else {
          const flowerIndex = Math.min(Math.floor((progressRatio - 0.6) * flower.length * 2.5), flower.length - 1);
          const base = flowerIndex < flower.length ? flower[flowerIndex] : { [`${prefixBloom} A`]: '4ml/L', [`${prefixBloom} B`]: '4ml/L', 'B-52': '2ml/L', 'Bud Candy': '2ml/L', 'Overdrive': '2ml/L', 'Flawless Finish': '0ml/L' };
          addWeek(i, base, `Flowering Week ${i}`);
        }
      }
    } else {
      // Photoperiod logic
      for (let i = 0; i < vegDuration; i++) addWeek(i + 1, veg[Math.min(i, veg.length - 1)], `Vegetative Week ${i + 1}`);
      for (let i = 0; i < 8; i++) {
        const base = i < flower.length ? flower[i] : { [`${prefixBloom} A`]: '4ml/L', [`${prefixBloom} B`]: '4ml/L', 'B-52': '2ml/L', 'Bud Candy': '2ml/L', 'Overdrive': '2ml/L', 'Flawless Finish': '0ml/L' };
        addWeek(vegDuration + i + 1, base, `Flowering Week ${i + 1}`);
      }
      flushWeek(vegDuration + 9);
      harvestWeek(vegDuration + 10);
    }
    return schedule;
  };

  if (isSensiCoco) return generateStandard('pH Perfect Sensi Coco Grow', 'pH Perfect Sensi Coco Bloom');
  if (isSensi) return generateStandard('pH Perfect Sensi Grow', 'pH Perfect Sensi Bloom');
  if (isConnoisseur) return generateStandard('pH Perfect Connoisseur Grow', 'pH Connoisseur Bloom');
  if (isGrowMicroBloom) return generateStandard('pH Perfect Grow', 'pH Perfect Bloom');

  if (isJungleJuice) {
    const jungle = [
      { Grow: convert(2), Micro: convert(2), Bloom: convert(2), 'Voodoo Juice': convert(8), 'B-52': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(5.5), Bloom: convert(4), 'Voodoo Juice': convert(8), 'B-52': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(6.5), Micro: convert(7), Bloom: convert(5), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(7), Micro: convert(7), Bloom: convert(7), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Bud Blood': '0.5g/L', 'Bud Candy': convert(8) },
    ];
    const flower = [
      { Grow: convert(5), Micro: convert(7), Bloom: convert(6.5), 'Voodoo Juice': convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Big Bud': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(7), Bloom: convert(6.5), 'Voodoo Juice': convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Big Bud': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(7), Bloom: convert(6.5), 'Voodoo Juice': convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Big Bud': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(7), Bloom: convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(7), Bloom: convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Big Bud': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(5), Micro: convert(7), Bloom: convert(8), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Big Bud': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(4), Micro: convert(5), Bloom: convert(6), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Overdrive': convert(8), 'Bud Candy': convert(8) },
      { Grow: convert(4), Micro: convert(5), Bloom: convert(6), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Overdrive': convert(8), 'Bud Candy': convert(8) },
    ];

    if (isAuto) {
      // Autoflower logic for Jungle Juice
      for (let i = 1; i <= totalWeeks; i++) {
        const progressRatio = i / totalWeeks;
        if (progressRatio > 0.95) {
          flushWeek(i);
        } else if (progressRatio <= 0.6) {
          const vegIndex = Math.min(i - 1, jungle.length - 1);
          addWeek(i, jungle[vegIndex], `Vegetative Week ${i}`);
        } else {
          const flowerIndex = Math.min(Math.floor((progressRatio - 0.6) * flower.length * 2.5), flower.length - 1);
          addWeek(i, flower[flowerIndex], `Flowering Week ${i}`);
        }
      }
    } else {
      // Photoperiod logic
      for (let i = 0; i < vegDuration; i++) addWeek(i + 1, jungle[Math.min(i, jungle.length - 1)], `Vegetative Week ${i + 1}`);
      flower.forEach((w, i) => addWeek(vegDuration + i + 1, w, `Flowering Week ${i + 1}`));
      flushWeek(vegDuration + 9);
      harvestWeek(vegDuration + 10);
    }
    return schedule;
  }

  return [];
};