// CANNA feeding schedule generator
export const generateCannaSchedule = (growData) => {
  const { type, vegWeeks, cannaMedium, waterAmount } = growData;
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // auto: total duration, photo: veg + flower + flush + harvest
  const schedule = [];
  const waterAmountNum = parseFloat(waterAmount);

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
        weekData['pH'] = '5.8–6.2';
        schedule.push(weekData);
        continue;
      }

      let cannaPhase;
      if (isVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          cannaPhase = 'rooting';
        } else if (i === 2 || i === 3) {
          cannaPhase = 'veg1';
        } else {
          cannaPhase = 'veg2';
        }
      } else {
        weekData.phase = `Flowering Week ${i}`;
        // Simple flower progression for autoflowers
        const flowerProgress = (progressRatio - 0.6) / 0.35;
        if (flowerProgress <= 0.25) {
          cannaPhase = 'gen1';
        } else if (flowerProgress <= 0.5) {
          cannaPhase = 'gen2';
        } else if (flowerProgress <= 0.75) {
          cannaPhase = 'gen3';
        } else {
          cannaPhase = 'gen4';
        }
      }

      // Apply medium-specific feeding
      applyMediumSchedule(weekData, cannaPhase, cannaMedium, waterAmountNum);
      weekData['pH'] = '5.8–6.2';
    } else {
      // Photoperiod logic
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      const flowerWeek = i - vegDuration;

      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = '5.8–6.2';
        schedule.push(weekData);
        continue;
      }

      if (isHarvest) {
        weekData.phase = 'Harvest Week';
        weekData['pH'] = '5.8–6.2';
        schedule.push(weekData);
        continue;
      }

      // Week-by-week phase determination
      let cannaPhase;
      if (isVeg) {
        weekData.phase = `Vegetative Week ${i}`;
        if (i === 1) {
          cannaPhase = 'rooting'; // Week 1: Start/Rooting
        } else if (i === 2 || i === 3) {
          cannaPhase = 'veg1'; // Week 2-3: Veg Phase I
        } else {
          cannaPhase = 'veg2'; // Week 4+: Veg Phase II (repeats)
        }
      } else if (isFlower) {
        weekData.phase = `Flowering Week ${flowerWeek}`;
        if (flowerWeek === 1 || flowerWeek === 2) {
          cannaPhase = 'gen1'; // Flower Week 1-2: Gen Period I
        } else if (flowerWeek === 3 || flowerWeek === 4) {
          cannaPhase = 'gen2'; // Flower Week 3-4: Gen Period II
        } else if (flowerWeek === 5 || flowerWeek === 6) {
          cannaPhase = 'gen3'; // Flower Week 5-6: Gen Period III
        } else {
          cannaPhase = 'gen4'; // Flower Week 7-8: Gen Period IV
        }
      }

      // Apply medium-specific feeding
      applyMediumSchedule(weekData, cannaPhase, cannaMedium, waterAmountNum);
      weekData['pH'] = '5.8–6.2';
    }

    schedule.push(weekData);
  }

  return schedule;
};

// Helper function to route to correct medium schedule
const applyMediumSchedule = (weekData, cannaPhase, cannaMedium, waterAmount) => {
  if (cannaMedium === 'Coco') {
    applyCocoSchedule(weekData, cannaPhase, waterAmount);
  } else if (cannaMedium === 'Terra') {
    applyTerraSchedule(weekData, cannaPhase, waterAmount);
  } else if (cannaMedium === 'Aqua') {
    applyAquaSchedule(weekData, cannaPhase, waterAmount);
  } else if (cannaMedium === 'Hydro') {
    applySubstraSchedule(weekData, cannaPhase, waterAmount);
  }
};

// CANNA Coco feeding schedule (A&B system)
const applyCocoSchedule = (weekData, phase, waterAmount) => {
  const schedules = {
    rooting: {
      'Coco A': { min: 1.6, max: 2.6 },
      'Coco B': { min: 1.6, max: 2.6 },
      'Rhizotonic': { min: 4.0, max: 4.0 }
    },
    veg1: {
      'Coco A': { min: 2.1, max: 3.2 },
      'Coco B': { min: 2.1, max: 3.2 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 }
    },
    veg2: {
      'Coco A': { min: 2.6, max: 3.4 },
      'Coco B': { min: 2.6, max: 3.4 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 2.1 }
    },
    gen1: {
      'Coco A': { min: 3.2, max: 4.0 },
      'Coco B': { min: 3.2, max: 4.0 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen2: {
      'Coco A': { min: 3.2, max: 4.0 },
      'Coco B': { min: 3.2, max: 4.0 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 },
      'PK 13/14': { min: 1.6, max: 1.6 }
    },
    gen3: {
      'Coco A': { min: 2.1, max: 3.2 },
      'Coco B': { min: 2.1, max: 3.2 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen4: {
      'Cannazym': { min: 2.6, max: 5.0 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    }
  };

  // Add EC values based on phase
  const ecValues = {
    rooting: '0.7-1.1',
    veg1: '0.9-1.3', 
    veg2: '1.1-1.5',
    gen1: '1.4-1.8',
    gen2: '1.6-2.0',
    gen3: '1.0-1.4',
    gen4: '0.0'
  };

  applyNutrientSchedule(weekData, schedules[phase], waterAmount);
  weekData['EC'] = ecValues[phase];
};

// CANNA Terra feeding schedule (Vega/Flores system)
const applyTerraSchedule = (weekData, phase, waterAmount) => {
  const schedules = {
    rooting: {
      'Terra Vega': { min: 1.6, max: 3.4 },
      'Rhizotonic': { min: 4.0, max: 4.0 }
    },
    veg1: {
      'Terra Vega': { min: 3.2, max: 5.0 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 }
    },
    veg2: {
      'Terra Vega': { min: 3.4, max: 5.5 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 2.1 }
    },
    gen1: {
      'Terra Flores': { min: 5.0, max: 7.1 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen2: {
      'Terra Flores': { min: 5.0, max: 7.1 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 },
      'PK 13/14': { min: 1.6, max: 1.6 }
    },
    gen3: {
      'Terra Flores': { min: 4.0, max: 6.1 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen4: {
      'Cannazym': { min: 2.6, max: 5.0 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    }
  };

  // Add EC values based on phase
  const ecValues = {
    rooting: '0.4-0.8',
    veg1: '0.7-1.1', 
    veg2: '0.9-1.3',
    gen1: '1.2-1.6',
    gen2: '1.5-1.9',
    gen3: '1.0-1.4',
    gen4: '0.0'
  };

  applyNutrientSchedule(weekData, schedules[phase], waterAmount);
  weekData['EC'] = ecValues[phase];
};

// CANNA Aqua feeding schedule (Recirculating Hydro)
const applyAquaSchedule = (weekData, phase, waterAmount) => {
  const schedules = {
    rooting: {
      'Aqua Vega': { min: 1.6, max: 2.6 },
      'Rhizotonic': { min: 4.0, max: 4.0 }
    },
    veg1: {
      'Aqua Vega': { min: 2.1, max: 3.2 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 }
    },
    veg2: {
      'Aqua Vega': { min: 2.6, max: 3.4 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 2.1 }
    },
    gen1: {
      'Aqua Flores': { min: 3.2, max: 4.0 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen2: {
      'Aqua Flores': { min: 3.2, max: 4.0 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 },
      'PK 13/14': { min: 1.6, max: 1.6 }
    },
    gen3: {
      'Aqua Flores': { min: 2.1, max: 3.2 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen4: {
      'Cannazym': { min: 2.6, max: 5.0 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    }
  };

  applyNutrientSchedule(weekData, schedules[phase], waterAmount);
};

// CANNA Substra feeding schedule (Run-to-Waste Hydro)
const applySubstraSchedule = (weekData, phase, waterAmount) => {
  const schedules = {
    rooting: {
      'Substra Vega': { min: 1.1, max: 2.1 },
      'Rhizotonic': { min: 4.0, max: 4.0 }
    },
    veg1: {
      'Substra Vega': { min: 1.6, max: 2.6 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 }
    },
    veg2: {
      'Substra Vega': { min: 2.1, max: 3.2 },
      'Rhizotonic': { min: 2.1, max: 2.1 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 2.1 }
    },
    gen1: {
      'Substra Flores': { min: 2.6, max: 3.4 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen2: {
      'Substra Flores': { min: 2.6, max: 3.4 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 },
      'PK 13/14': { min: 1.6, max: 1.6 }
    },
    gen3: {
      'Substra Flores': { min: 1.6, max: 2.6 },
      'Rhizotonic': { min: 0.5, max: 0.5 },
      'Cannazym': { min: 2.6, max: 2.6 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    },
    gen4: {
      'Cannazym': { min: 2.6, max: 5.0 },
      'Cannaboost': { min: 2.1, max: 4.0 }
    }
  };

  applyNutrientSchedule(weekData, schedules[phase], waterAmount);
};

// Helper function to apply nutrient dosing
const applyNutrientSchedule = (weekData, schedule, waterAmount) => {
  for (const [nutrient, dosing] of Object.entries(schedule)) {
    if (dosing.min === dosing.max) {
      // Single dosage - output as ml/L rate (like BioBizz)
      weekData[nutrient] = dosing.min;
    } else {
      // Range dosage - use middle of range and output as ml/L rate
      const midPoint = (dosing.min + dosing.max) / 2;
      const rounded = Math.round(midPoint * 10) / 10;
      weekData[nutrient] = rounded;
    }
  }
};