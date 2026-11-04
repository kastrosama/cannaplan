// BioBizz feeding schedule generator
export const generateBioBizzSchedule = (growData) => {
  const { type, vegWeeks, soilType } = growData;
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // auto: total duration, photo: veg + flower + flush + harvest
  const schedule = [];
  const isLightOrCoco = soilType === 'Light-Mix' || soilType === 'Coco';

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };
    
    if (isAuto) {
      // Autoflower logic
      const progressRatio = i / totalWeeks;
      const isEarlyVeg = progressRatio <= 0.3;
      const isLateVeg = progressRatio > 0.3 && progressRatio <= 0.5;
      const isFlower = progressRatio > 0.5 && progressRatio <= 0.9;
      const isFlush = progressRatio > 0.9;

      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = '6.2–6.3';
      } else if (isEarlyVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          weekData['Bio·Heaven'] = 2;
          weekData['Acti·Vera'] = 2;
          weekData['Root·Juice'] = 4;
          if (isLightOrCoco) weekData['Cal·Mag'] = 0.3;
        } else {
          weekData['Fish·Mix'] = isLightOrCoco ? 2 : 1;
          weekData['Bio·Heaven'] = 2;
          weekData['Acti·Vera'] = 2;
          if (isLightOrCoco) weekData['Cal·Mag'] = 0.3;
        }
        weekData['pH'] = '6.2–6.3';
      } else {
        // Flowering for autoflowers
        weekData.phase = `Flowering Week ${i}`;
        weekData['Bio·Grow'] = isLightOrCoco ? 2 : 1;
        weekData['Bio·Bloom'] = 2;
        weekData['Top·Max'] = 1;
        weekData['Bio·Heaven'] = 3;
        weekData['Acti·Vera'] = 3;
        if (isLightOrCoco) weekData['Cal·Mag'] = 0.5;
        weekData['pH'] = '6.2–6.3';
      }
    } else {
      // Photoperiod logic (existing code)
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      const flowerWeek = i - vegDuration;

      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = '6.2–6.3';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';
        weekData['pH'] = '6.2–6.3';
      } else if (isVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          weekData['Bio·Heaven'] = 2;
          weekData['Acti·Vera'] = 2;
          weekData['Root·Juice'] = 4;
          if (isLightOrCoco) weekData['Cal·Mag'] = 0.3;
        } else {
          weekData['Fish·Mix'] = isLightOrCoco ? 2 : 1;
          weekData['Bio·Heaven'] = 2;
          weekData['Acti·Vera'] = 2;
          if (isLightOrCoco) weekData['Cal·Mag'] = 0.3;
        }
        weekData['pH'] = '6.2–6.3';
      } else if (isFlower) {
        weekData.phase = `Flowering Week ${flowerWeek}`;
        const flowerFeed = [
          { grow: 1, bloom: 1, top: 1, heaven: 2, vera: 2, calmag: 0.3 },
          { grow: 1, bloom: 2, top: 1, heaven: 2, vera: 2, calmag: 0.5 },
          { grow: 1, bloom: 2, top: 1, heaven: 3, vera: 3, calmag: 0.5 },
          { grow: 1, bloom: 3, top: 1, heaven: 4, vera: 4, calmag: 0.5 },
          { grow: 1, bloom: 3, top: 1, heaven: 4, vera: 4, calmag: 0.5 },
          { grow: 1, bloom: 4, top: 4, heaven: 5, vera: 5, calmag: 1.0 },
          { grow: 1, bloom: 4, top: 4, heaven: 5, vera: 5, calmag: 1.0 },
          { grow: 1, bloom: 4, top: 4, heaven: 5, vera: 5, calmag: 0.5 },
        ];
        const feed = flowerFeed[flowerWeek - 1];
        if (feed) {
          weekData['Bio·Grow'] = isLightOrCoco ? feed.grow * 2 : feed.grow;
          weekData['Bio·Bloom'] = feed.bloom;
          weekData['Top·Max'] = feed.top;
          weekData['Bio·Heaven'] = feed.heaven;
          weekData['Acti·Vera'] = feed.vera;
          if (isLightOrCoco && feed.calmag != null) weekData['Cal·Mag'] = feed.calmag;
        }
        weekData['pH'] = '6.2–6.3';
      }
    }
    
    schedule.push(weekData);
  }

  return schedule;
};