// generateAdvancedNutrientsSchedule.js

export const generateAdvancedNutrientsSchedule = (lineName, vegWeeks = 4) => {
  const schedule = [];

  const isJungleJuice = lineName === 'Jungle Juice';
  const isOGOrganics = lineName.includes('OG Organics');
  const isSensiCoco = lineName.includes('Sensi Coco');
  const isSensi = lineName === 'pH Perfect Sensi Grow/Bloom';
  const isConnoisseur = lineName.includes('Connoisseur');
  const isGrowMicroBloom = lineName === 'pH Perfect Grow Micro Bloom';

  const convert = (mlPerGal) => Math.ceil(mlPerGal / 3.785);

  const addWeek = (weekNum, nutrients) => {
    schedule.push({ week: weekNum, ...nutrients });
  };

  const flushWeek = (weekNum) => {
    addWeek(weekNum, { Water: 'Only' });
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
    veg.slice(0, vegWeeks).forEach((w, i) => addWeek(i + 1, w));
    for (let i = 0; i < 8; i++) {
      const base = i < flower.length ? flower[i] : { "Iguana Juice Bloom": '4ml/L', "Ancient Earth": '2ml/L', "Bud Candy": '2ml/L', "Bigmikes OG Tea": '2ml/L', "Grandma Enggy's F1": '2ml/L', "Sensizym": '2ml/L', "Big Bud": '2ml/L', "Nirvana": '2ml/L', "Sensi CalMag Xtra": '0.5ml/L spray (1x)' };
      addWeek(vegWeeks + i + 1, base);
    }
    flushWeek(vegWeeks + 9);
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
    veg.slice(0, vegWeeks).forEach((w, i) => addWeek(i + 1, w));
    for (let i = 0; i < 8; i++) {
      const base = i < flower.length ? flower[i] : { [`${prefixBloom} A`]: '4ml/L', [`${prefixBloom} B`]: '4ml/L', 'B-52': '2ml/L', 'Bud Candy': '2ml/L', 'Overdrive': '2ml/L', 'Flawless Finish': '0ml/L' };
      addWeek(vegWeeks + i + 1, base);
    }
    flushWeek(vegWeeks + 9);
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
      { Grow: convert(7), Micro: convert(7), Bloom: convert(7), 'B-52': convert(8), 'Rhino Skin': convert(8), 'Bud Blood': '2g/Gal', 'Bud Candy': convert(8) },
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
    jungle.slice(0, vegWeeks).forEach((w, i) => addWeek(i + 1, w));
    flower.forEach((w, i) => addWeek(vegWeeks + i + 1, w));
    flushWeek(vegWeeks + 9);
    return schedule;
  }

  return [];
};
