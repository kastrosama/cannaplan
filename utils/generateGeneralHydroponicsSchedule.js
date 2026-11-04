// General Hydroponics Flora Series, MaxiSeries, and BioThrive feeding schedule generator
export const generateGeneralHydroponicsSchedule = (growData) => {
  const { type, vegWeeks, generalHydroponicsLine, generalHydroponicsIntensity, generalHydroponicsEnvironment, generalHydroponicsMedium } = growData;
  
  let schedule = [];
  
  // Handle Flora Series
  if (generalHydroponicsLine === 'Flora Series') {
    schedule = generateFloraSeriesSchedule(growData);
  }
  // Handle MaxiSeries
  else if (generalHydroponicsLine === 'MaxiSeries') {
    schedule = generateMaxiSeriesSchedule(growData);
  }
  // Handle BioThrive
  else if (generalHydroponicsLine === 'Organics (BioThrive)') {
    schedule = generateBioThriveSchedule(growData);
  }
  // Handle FloraNova
  else if (generalHydroponicsLine === 'FloraNova') {
    schedule = generateFloraNovaSchedule(growData);
  }
  // Other lines not yet implemented
  else {
    return [];
  }
  
  // Return in consistent format expected by the app
  return {
    brand: 'General Hydroponics',
    productLine: generalHydroponicsLine,
    plantType: type || 'photoperiod',
    totalWeeks: schedule.length,
    schedule: schedule,
    phases: calculatePhases(schedule, type, parseInt(vegWeeks))
  };
};

// Helper function to calculate phase breakdown for consistent return format
function calculatePhases(schedule, type, vegWeeks) {
  const isAuto = type === 'Autoflower';
  
  if (isAuto) {
    return {
      vegetative: Math.floor(vegWeeks * 0.4),
      flowering: Math.floor(vegWeeks * 0.6) - 1,
      flush: 1
    };
  } else {
    return {
      vegetative: vegWeeks,
      flowering: 8,
      flush: 1,
      harvest: 1
    };
  }
}

// BioThrive schedule generator
function generateBioThriveSchedule(growData) {
  const { type, vegWeeks, generalHydroponicsIntensity, generalHydroponicsMedium } = growData;
  
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // photo: flower + flush + harvest
  
  const schedule = [];
  const isSoil = generalHydroponicsMedium === 'Soil';
  const feedingIntensity = generalHydroponicsIntensity ? generalHydroponicsIntensity.toLowerCase() : 'medium';
  
  // BioThrive feeding charts (ml/L) - converted from official ml/gallon charts
  const bioThriveCharts = {
    light: [
      { week: 1, phase: 'Seedling/Clone', grow: 0.9, bloom: 0, camg: 0.4, ec: '0.2-0.4', ppm: '100-200' },
      { week: 2, phase: 'Early Growth', grow: 1.5, bloom: 0, camg: 0.5, ec: '0.4-0.6', ppm: '200-300' },
      { week: 3, phase: 'Early Growth', grow: 1.8, bloom: 0, camg: 0.7, ec: '0.6-0.8', ppm: '300-400' },
      { week: 4, phase: 'Late Growth', grow: 2.2, bloom: 0, camg: 0.9, ec: '0.8-1.0', ppm: '400-500' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 2.8, camg: 1.6, ec: '1.1-1.4', ppm: '550-700' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 2.8, camg: 1.6, ec: '1.1-1.4', ppm: '550-700' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 2.2, camg: 1.4, ec: '0.9-1.1', ppm: '450-550' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 2.2, camg: 1.4, ec: '0.9-1.1', ppm: '450-550' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 2.2, camg: 1.4, ec: '0.9-1.1', ppm: '450-550' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 1.8, camg: 0.9, ec: '0.7-0.9', ppm: '350-500' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 1.8, camg: 0.9, ec: '0.7-0.9', ppm: '350-500' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 0.9, camg: 0.9, ec: '0.4-0.6', ppm: '200-300' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, camg: 0, ec: '0', ppm: '0' }
    ],
    medium: [
      { week: 1, phase: 'Seedling/Clone', grow: 1.1, bloom: 0, camg: 0.4, ec: '0.3-0.5', ppm: '150-250' },
      { week: 2, phase: 'Early Growth', grow: 1.7, bloom: 0, camg: 0.7, ec: '0.5-0.7', ppm: '250-350' },
      { week: 3, phase: 'Early Growth', grow: 2.1, bloom: 0, camg: 0.8, ec: '0.7-0.9', ppm: '350-450' },
      { week: 4, phase: 'Late Growth', grow: 2.6, bloom: 0, camg: 1.1, ec: '0.9-1.1', ppm: '450-550' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 3.2, camg: 1.7, ec: '1.2-1.5', ppm: '600-750' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 3.2, camg: 1.7, ec: '1.2-1.5', ppm: '600-750' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 2.6, camg: 1.6, ec: '1.0-1.3', ppm: '500-650' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 2.6, camg: 1.6, ec: '1.0-1.3', ppm: '500-650' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 2.6, camg: 1.6, ec: '1.0-1.3', ppm: '500-650' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 2.1, camg: 1.1, ec: '0.8-1.0', ppm: '400-500' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 2.1, camg: 1.1, ec: '0.8-1.0', ppm: '400-500' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 1.1, camg: 1.1, ec: '0.5-0.7', ppm: '250-350' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, camg: 0, ec: '0', ppm: '0' }
    ],
    aggressive: [
      { week: 1, phase: 'Seedling/Clone', grow: 1.3, bloom: 0, camg: 0.5, ec: '0.4-0.6', ppm: '200-300' },
      { week: 2, phase: 'Early Growth', grow: 2.1, bloom: 0, camg: 0.8, ec: '0.6-0.8', ppm: '300-400' },
      { week: 3, phase: 'Early Growth', grow: 2.6, bloom: 0, camg: 1.1, ec: '0.8-1.0', ppm: '400-500' },
      { week: 4, phase: 'Late Growth', grow: 3.3, bloom: 0, camg: 1.3, ec: '1.0-1.2', ppm: '500-600' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 4.0, camg: 2.2, ec: '1.5-1.8', ppm: '750-800' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 4.0, camg: 2.2, ec: '1.5-1.8', ppm: '750-800' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 3.3, camg: 2.0, ec: '1.2-1.5', ppm: '600-750' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 3.3, camg: 2.0, ec: '1.2-1.5', ppm: '600-750' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 3.3, camg: 2.0, ec: '1.2-1.5', ppm: '600-750' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 2.6, camg: 1.3, ec: '0.9-1.1', ppm: '450-550' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 2.6, camg: 1.3, ec: '0.9-1.1', ppm: '450-550' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 1.3, camg: 1.3, ec: '0.6-0.8', ppm: '300-400' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, camg: 0, ec: '0', ppm: '0' }
    ]
  };

  const chart = bioThriveCharts[feedingIntensity];

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };
    
    if (isAuto) {
      // For autoflowers, map weeks to chart based on total duration
      const chartWeek = mapAutoWeekToChart(i, vegDuration);
      const nutrientData = chart[chartWeek - 1];
      
      if (nutrientData) {
        weekData.phase = nutrientData.phase;
        addBioThriveNutrientData(weekData, nutrientData, generalHydroponicsMedium);
      }
    } else {
      // For photoperiod plants
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      
      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = isSoil ? '6.0–7.0' : '5.8–6.2';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';
        weekData['pH'] = isSoil ? '6.0–7.0' : '5.8–6.2';
      } else {
        // Map grow week to chart week
        let chartWeek;
        if (isVeg) {
          // For extended veg, repeat week 4 data for weeks beyond 4
          chartWeek = Math.min(i, 4);
        } else {
          // Flower weeks map to chart weeks 5-12
          chartWeek = 4 + (i - vegDuration);
        }
        
        const nutrientData = chart[chartWeek - 1];
        if (nutrientData) {
          if (isVeg) {
            weekData.phase = `Vegetative Week ${i}`;
          } else {
            const flowerWeek = i - vegDuration;
            weekData.phase = `Flowering Week ${flowerWeek}`;
          }
          
          addBioThriveNutrientData(weekData, nutrientData, generalHydroponicsMedium);
        }
      }
    }
    
    schedule.push(weekData);
  }
  
  return schedule;
}
// FloraNova schedule generator
function generateFloraNovaSchedule(growData) {
  const { type, vegWeeks, generalHydroponicsIntensity, generalHydroponicsMedium } = growData;
  
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // photo: flower + flush + harvest
  
  const schedule = [];
  const isSoil = generalHydroponicsMedium === 'Soil';
  const feedingIntensity = generalHydroponicsIntensity ? generalHydroponicsIntensity.toLowerCase() : 'medium';
  
  // FloraNova feeding charts (ml/L) - converted from official ml/gallon charts
  const floranovaCharts = {
    light: [
      { week: 1, phase: 'Seedling/Clone', grow: 0.5, bloom: 0, ec: '0.5-0.7', ppm: '250-350' },
      { week: 2, phase: 'Early Growth', grow: 0.9, bloom: 0, ec: '0.9-1.2', ppm: '450-600' },
      { week: 3, phase: 'Early Growth', grow: 1.1, bloom: 0, ec: '1.2-1.5', ppm: '600-750' },
      { week: 4, phase: 'Late Growth', grow: 1.4, bloom: 0, ec: '1.5-1.8', ppm: '750-900' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 1.4, ec: '1.5-1.8', ppm: '750-900' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 1.4, ec: '1.5-1.8', ppm: '750-900' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 1.2, ec: '1.2-1.5', ppm: '600-750' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 1.2, ec: '1.2-1.5', ppm: '600-750' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 1.2, ec: '1.2-1.5', ppm: '600-750' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 0.9, ec: '1.0-1.3', ppm: '500-650' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 0.9, ec: '1.0-1.3', ppm: '500-650' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 0.8, ec: '0.8-1.0', ppm: '400-500' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, ec: '0', ppm: '0' }
    ],
    medium: [
      { week: 1, phase: 'Seedling/Clone', grow: 0.5, bloom: 0, ec: '0.6-0.8', ppm: '300-400' },
      { week: 2, phase: 'Early Growth', grow: 1.1, bloom: 0, ec: '1.2-1.5', ppm: '600-750' },
      { week: 3, phase: 'Early Growth', grow: 1.3, bloom: 0, ec: '1.5-1.8', ppm: '750-900' },
      { week: 4, phase: 'Late Growth', grow: 1.6, bloom: 0, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 1.6, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 1.6, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 1.3, ec: '1.5-1.8', ppm: '750-900' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 1.3, ec: '1.5-1.8', ppm: '750-900' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 1.3, ec: '1.5-1.8', ppm: '750-900' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 1.1, ec: '1.1-1.4', ppm: '550-700' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 1.1, ec: '1.1-1.4', ppm: '550-700' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 0.9, ec: '1.0-1.2', ppm: '500-600' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, ec: '0', ppm: '0' }
    ],
    aggressive: [
      { week: 1, phase: 'Seedling/Clone', grow: 0.7, bloom: 0, ec: '0.8-1.0', ppm: '400-500' },
      { week: 2, phase: 'Early Growth', grow: 1.3, bloom: 0, ec: '1.5-1.8', ppm: '750-900' },
      { week: 3, phase: 'Early Growth', grow: 1.6, bloom: 0, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 4, phase: 'Late Growth', grow: 2.0, bloom: 0, ec: '2.2-2.5', ppm: '1100-1250' },
      { week: 5, phase: 'Early Bloom', grow: 0, bloom: 2.0, ec: '2.1-2.4', ppm: '1050-1200' },
      { week: 6, phase: 'Early Bloom', grow: 0, bloom: 2.0, ec: '2.1-2.4', ppm: '1050-1200' },
      { week: 7, phase: 'Mid Bloom', grow: 0, bloom: 1.7, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 8, phase: 'Mid Bloom', grow: 0, bloom: 1.7, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 9, phase: 'Mid Bloom', grow: 0, bloom: 1.7, ec: '1.8-2.1', ppm: '900-1050' },
      { week: 10, phase: 'Late Bloom', grow: 0, bloom: 1.3, ec: '1.4-1.7', ppm: '700-850' },
      { week: 11, phase: 'Late Bloom', grow: 0, bloom: 1.3, ec: '1.4-1.7', ppm: '700-850' },
      { week: 12, phase: 'Ripen', grow: 0, bloom: 1.1, ec: '1.2-1.4', ppm: '600-700' },
      { week: 13, phase: 'Flush', grow: 0, bloom: 0, ec: '0', ppm: '0' }
    ]
  };

  const chart = floranovaCharts[feedingIntensity];

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };
    
    if (isAuto) {
      // For autoflowers, map weeks to chart based on total duration
      const chartWeek = mapAutoWeekToChart(i, vegDuration);
      const nutrientData = chart[chartWeek - 1];
      
      if (nutrientData) {
        weekData.phase = nutrientData.phase;
        addFloraNovaNutrientData(weekData, nutrientData, generalHydroponicsMedium);
      }
    } else {
      // For photoperiod plants
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      
      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else {
        // Map grow week to chart week
        let chartWeek;
        if (isVeg) {
          // For extended veg, repeat week 4 data for weeks beyond 4
          chartWeek = Math.min(i, 4);
        } else {
          // Flower weeks map to chart weeks 5-12
          chartWeek = 4 + (i - vegDuration);
        }
        
        const nutrientData = chart[chartWeek - 1];
        if (nutrientData) {
          if (isVeg) {
            weekData.phase = `Vegetative Week ${i}`;
          } else {
            const flowerWeek = i - vegDuration;
            weekData.phase = `Flowering Week ${flowerWeek}`;
          }
          
          addFloraNovaNutrientData(weekData, nutrientData, generalHydroponicsMedium);
        }
      }
    }
    
    schedule.push(weekData);
  }
  
  return schedule;
}

// Helper function to add FloraNova nutrient data (already in ml/L)
function addFloraNovaNutrientData(weekData, nutrientData, medium) {
  const isSoil = medium === 'Soil';
  
  if (nutrientData.phase === 'Flush') {
    weekData['pH'] = isSoil ? '6.0–6.5' : medium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
    return;
  }
  
  // Values are already in ml/L - no conversion needed
  if (nutrientData.grow > 0) {
    weekData['FloraNova Grow'] = nutrientData.grow;
  }
  if (nutrientData.bloom > 0) {
    weekData['FloraNova Bloom'] = nutrientData.bloom;
  }
  
  // Set pH based on medium
  weekData['pH'] = isSoil ? '6.0–6.5' : medium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
  
  // Add EC and TDS for all mediums (nutrient solution measurements)
  if (nutrientData.ec && nutrientData.ppm && nutrientData.ec !== '0') {
    weekData['EC'] = nutrientData.ec;
    weekData['TDS'] = nutrientData.ppm;
  }
}

function addBioThriveNutrientData(weekData, nutrientData, medium) {
  const isSoil = medium === 'Soil';
  
  if (nutrientData.phase === 'Flush') {
    weekData['pH'] = isSoil ? '6.0–7.0' : '5.8–6.2';
    return;
  }
  
  // Values are already in ml/L - no conversion needed
  if (nutrientData.grow > 0) {
    weekData['BioThrive Grow'] = nutrientData.grow;
  }
  if (nutrientData.bloom > 0) {
    weekData['BioThrive Bloom'] = nutrientData.bloom;
  }
  if (nutrientData.camg > 0) {
    weekData['CaMg+'] = nutrientData.camg;
  }
  
  // Set pH based on medium
  weekData['pH'] = isSoil ? '6.0–7.0' : '5.8–6.2';
  
  // Add EC and TDS for all mediums (nutrient solution measurements)
  if (nutrientData.ec && nutrientData.ppm && nutrientData.ec !== '0') {
    weekData['EC'] = nutrientData.ec;
    weekData['TDS'] = nutrientData.ppm;
  }
}

// Flora Series schedule generator
function generateFloraSeriesSchedule(growData) {
  const { type, vegWeeks, generalHydroponicsIntensity, generalHydroponicsMedium } = growData;
  
  const vegDuration = parseInt(vegWeeks);
  
  // Handle autoflowers vs photoperiod
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2; // photo: flower + flush + harvest
  
  const schedule = [];
  
  // Use the selected feeding intensity for Flora Series
  const isSoil = generalHydroponicsMedium === 'Soil';
  const feedingIntensity = generalHydroponicsIntensity ? generalHydroponicsIntensity.toLowerCase() : 'medium';
  
  // Official GH Flora Series feeding charts (ml/L) - converted from ml/gallon
  const feedingCharts = {
    light: [
      { week: 1, phase: 'Seedling/Clone', micro: 0.5, gro: 0.5, bloom: 0.5, ec: '0.4-0.5', ppm: '200-300' },
      { week: 2, phase: 'Early Growth', micro: 1.0, gro: 0.9, bloom: 0.7, ec: '0.9-1.1', ppm: '400-550' },
      { week: 3, phase: 'Early Growth', micro: 1.3, gro: 1.2, bloom: 0.9, ec: '1.2-1.4', ppm: '550-750' },
      { week: 4, phase: 'Late Growth', micro: 1.6, gro: 1.5, bloom: 1.1, ec: '1.4-1.7', ppm: '700-900' },
      { week: 5, phase: 'Early Bloom', micro: 1.4, gro: 1.2, bloom: 1.6, ec: '1.4-1.7', ppm: '700-850' },
      { week: 6, phase: 'Early Bloom', micro: 1.4, gro: 1.2, bloom: 1.6, ec: '1.4-1.7', ppm: '700-850' },
      { week: 7, phase: 'Mid Bloom', micro: 1.2, gro: 1.2, bloom: 1.7, ec: '1.4-1.7', ppm: '700-850' },
      { week: 8, phase: 'Mid Bloom', micro: 1.2, gro: 1.2, bloom: 1.7, ec: '1.4-1.7', ppm: '700-850' },
      { week: 9, phase: 'Mid Bloom', micro: 1.2, gro: 1.2, bloom: 1.7, ec: '1.4-1.7', ppm: '700-850' },
      { week: 10, phase: 'Late Bloom', micro: 0.9, gro: 0.9, bloom: 1.1, ec: '0.9-1.1', ppm: '450-600' },
      { week: 11, phase: 'Late Bloom', micro: 0.9, gro: 0.9, bloom: 1.1, ec: '0.9-1.1', ppm: '450-600' },
      { week: 12, phase: 'Ripen', micro: 0.5, gro: 0.5, bloom: 0.8, ec: '0.6-0.8', ppm: '300-400' },
      { week: 13, phase: 'Flush', micro: 0, gro: 0, bloom: 0, ec: '', ppm: '' }
    ],
    medium: [
      { week: 1, phase: 'Seedling/Clone', micro: 0.5, gro: 0.5, bloom: 0.5, ec: '0.5-0.6', ppm: '250-350' },
      { week: 2, phase: 'Early Growth', micro: 1.1, gro: 1.0, bloom: 0.8, ec: '1.0-1.2', ppm: '500-650' },
      { week: 3, phase: 'Early Growth', micro: 1.5, gro: 1.4, bloom: 1.0, ec: '1.3-1.6', ppm: '650-850' },
      { week: 4, phase: 'Late Growth', micro: 1.8, gro: 1.7, bloom: 1.3, ec: '1.6-2.0', ppm: '800-1000' },
      { week: 5, phase: 'Early Bloom', micro: 1.6, gro: 1.4, bloom: 1.8, ec: '1.6-1.9', ppm: '800-1000' },
      { week: 6, phase: 'Early Bloom', micro: 1.6, gro: 1.4, bloom: 1.8, ec: '1.6-1.9', ppm: '800-1000' },
      { week: 7, phase: 'Mid Bloom', micro: 1.4, gro: 1.4, bloom: 2.0, ec: '1.6-1.9', ppm: '800-1000' },
      { week: 8, phase: 'Mid Bloom', micro: 1.4, gro: 1.4, bloom: 2.0, ec: '1.6-1.9', ppm: '800-1000' },
      { week: 9, phase: 'Mid Bloom', micro: 1.4, gro: 1.4, bloom: 2.0, ec: '1.6-1.9', ppm: '800-1000' },
      { week: 10, phase: 'Late Bloom', micro: 1.0, gro: 1.0, bloom: 1.2, ec: '1.0-1.3', ppm: '500-650' },
      { week: 11, phase: 'Late Bloom', micro: 1.0, gro: 1.0, bloom: 1.2, ec: '1.0-1.3', ppm: '500-650' },
      { week: 12, phase: 'Ripen', micro: 0.6, gro: 0.6, bloom: 1.0, ec: '0.7-0.9', ppm: '350-450' },
      { week: 13, phase: 'Flush', micro: 0, gro: 0, bloom: 0, ec: '', ppm: '' }
    ],
    aggressive: [
      { week: 1, phase: 'Seedling/Clone', micro: 0.7, gro: 0.7, bloom: 0.7, ec: '0.6-0.8', ppm: '300-400' },
      { week: 2, phase: 'Early Growth', micro: 1.4, gro: 1.3, bloom: 1.0, ec: '1.3-1.5', ppm: '600-800' },
      { week: 3, phase: 'Early Growth', micro: 1.8, gro: 1.7, bloom: 1.3, ec: '1.7-2.1', ppm: '850-1050' },
      { week: 4, phase: 'Late Growth', micro: 2.2, gro: 2.1, bloom: 1.6, ec: '2.0-2.5', ppm: '1050-1250' },
      { week: 5, phase: 'Early Bloom', micro: 2.0, gro: 1.7, bloom: 2.2, ec: '2.0-2.4', ppm: '1000-1200' },
      { week: 6, phase: 'Early Bloom', micro: 2.0, gro: 1.7, bloom: 2.2, ec: '2.0-2.4', ppm: '1000-1200' },
      { week: 7, phase: 'Mid Bloom', micro: 1.7, gro: 1.7, bloom: 2.5, ec: '1.9-2.4', ppm: '950-1200' },
      { week: 8, phase: 'Mid Bloom', micro: 1.7, gro: 1.7, bloom: 2.5, ec: '1.9-2.4', ppm: '950-1200' },
      { week: 9, phase: 'Mid Bloom', micro: 1.7, gro: 1.7, bloom: 2.5, ec: '1.9-2.4', ppm: '950-1200' },
      { week: 10, phase: 'Late Bloom', micro: 1.2, gro: 1.2, bloom: 1.5, ec: '1.3-1.6', ppm: '650-800' },
      { week: 11, phase: 'Late Bloom', micro: 1.2, gro: 1.2, bloom: 1.5, ec: '1.3-1.6', ppm: '650-800' },
      { week: 12, phase: 'Ripen', micro: 0.7, gro: 0.7, bloom: 1.2, ec: '0.9-1.1', ppm: '450-550' },
      { week: 13, phase: 'Flush', micro: 0, gro: 0, bloom: 0, ec: '', ppm: '' }
    ]
  };

  const chart = feedingCharts[feedingIntensity];

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };
    
    if (isAuto) {
      // For autoflowers, map weeks to chart based on total duration
      const chartWeek = mapAutoWeekToChart(i, vegDuration);
      const nutrientData = chart[chartWeek - 1];
      
      if (nutrientData) {
        weekData.phase = nutrientData.phase;
        addFloraSeriesNutrientData(weekData, nutrientData, generalHydroponicsMedium);
      }
    } else {
      // For photoperiod plants
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      
      if (isFlush) {
        weekData.phase = 'Flush Week';
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else {
        // Map grow week to chart week
        let chartWeek;
        if (isVeg) {
          chartWeek = Math.min(i, 4); // Veg weeks 1-4
        } else {
          chartWeek = 4 + (i - vegDuration); // Flower weeks 5-12
        }
        
        const nutrientData = chart[chartWeek - 1];
        if (nutrientData) {
          if (isVeg) {
            weekData.phase = `Vegetative Week ${i}`;
          } else {
            const flowerWeek = i - vegDuration;
            weekData.phase = `Flowering Week ${flowerWeek}`;
          }
          
          addFloraSeriesNutrientData(weekData, nutrientData, generalHydroponicsMedium);
        }
      }
    }
    
    schedule.push(weekData);
  }
  
  return schedule;
}

// FIXED: MaxiSeries schedule generator with proper phase labels
function generateMaxiSeriesSchedule(growData) {
  const { type, vegWeeks, generalHydroponicsIntensity, generalHydroponicsEnvironment, generalHydroponicsMedium } = growData;
  
  const vegDuration = parseInt(vegWeeks);
  const isAuto = type === 'Autoflower';
  const totalWeeks = isAuto ? vegDuration : vegDuration + 8 + 2;
  
  const schedule = [];
  const isSoil = generalHydroponicsMedium === 'Soil';
  const feedingIntensity = generalHydroponicsIntensity ? generalHydroponicsIntensity.toLowerCase() : 'medium';
  const isIndoor = generalHydroponicsEnvironment === 'Indoor';
  
  // MaxiSeries feeding charts (grams/L) - converted from grams/gallon
  const maxiCharts = {
    indoor: {
      light: [
        { stage: 'Early Growth', maxigro: 0.71, maxibloom: 0, calimagic: 1.8, ec: '0.9-1.3', ppm: '450-650' },
        { stage: 'Late Growth', maxigro: 1.06, maxibloom: 0, calimagic: 1.8, ec: '1.3-1.6', ppm: '650-800' },
        { stage: 'Early-Mid Bloom', maxigro: 0, maxibloom: 1.06, calimagic: 2.5, ec: '1.4-1.7', ppm: '700-850' },
        { stage: 'Late Bloom-Ripen', maxigro: 0, maxibloom: 1.00, calimagic: 1.5, ec: '1.2-1.5', ppm: '600-750' }
      ],
      medium: [
        { stage: 'Early Growth', maxigro: 0.79, maxibloom: 0, calimagic: 2.0, ec: '1.1-1.4', ppm: '550-700' },
        { stage: 'Late Growth', maxigro: 1.19, maxibloom: 0, calimagic: 2.0, ec: '1.5-1.8', ppm: '750-900' },
        { stage: 'Early-Mid Bloom', maxigro: 0, maxibloom: 1.19, calimagic: 2.8, ec: '1.6-1.9', ppm: '800-950' },
        { stage: 'Late Bloom-Ripen', maxigro: 0, maxibloom: 1.19, calimagic: 2.0, ec: '1.4-1.7', ppm: '700-850' }
      ],
      aggressive: [
        { stage: 'Early Growth', maxigro: 1.00, maxibloom: 0, calimagic: 2.5, ec: '1.4-1.8', ppm: '700-900' },
        { stage: 'Late Growth', maxigro: 1.45, maxibloom: 0, calimagic: 2.5, ec: '1.9-2.3', ppm: '850-1150' },
        { stage: 'Early-Mid Bloom', maxigro: 0, maxibloom: 1.51, calimagic: 3.5, ec: '2.2-2.6', ppm: '1100-1300' },
        { stage: 'Late Bloom-Ripen', maxigro: 0, maxibloom: 1.45, calimagic: 2.0, ec: '1.8-2.2', ppm: '900-1100' }
      ]
    },
    outdoor: {
      light: [
        { stage: 'Growth', maxigro: 1.21, maxibloom: 0, ec: '1.3-1.6', ppm: '650-800' },
        { stage: 'Bloom', maxigro: 0, maxibloom: 1.03, ec: '1.4-1.7', ppm: '700-850' }
      ],
      medium: [
        { stage: 'Growth', maxigro: 1.37, maxibloom: 0, ec: '1.5-1.8', ppm: '750-900' },
        { stage: 'Bloom', maxigro: 0, maxibloom: 1.16, ec: '1.6-1.9', ppm: '800-950' }
      ],
      aggressive: [
        { stage: 'Growth', maxigro: 1.72, maxibloom: 0, ec: '1.9-2.3', ppm: '850-1150' },
        { stage: 'Bloom', maxigro: 0, maxibloom: 1.45, ec: '2.2-2.6', ppm: '1100-1300' }
      ]
    }
  };

  const chart = maxiCharts[isIndoor ? 'indoor' : 'outdoor'][feedingIntensity];

  for (let i = 1; i <= totalWeeks; i++) {
    const weekData = { week: i };
    
    if (isAuto) {
      // For autoflowers, determine stage based on progress
      const progressRatio = i / vegDuration;
      
      if (i >= vegDuration - 1) {
        weekData.phase = 'Flush Week 1';  // Fixed: Added proper phase label
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else if (i >= vegDuration) {
        weekData.phase = 'Harvest Week';  // Fixed: Added proper phase label
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else {
        const stageIndex = progressRatio <= 0.6 ? 0 : 1; // Growth vs Bloom
        
        // Fixed: Add proper autoflower phase labels based on progress
        if (progressRatio <= 0.4) {
          weekData.phase = `Vegetative Week ${i}`;
        } else {
          const flowerWeek = i - Math.floor(vegDuration * 0.4);
          weekData.phase = `Flowering Week ${flowerWeek}`;
        }
        
        addMaxiNutrientData(weekData, chart[Math.min(stageIndex, chart.length - 1)], generalHydroponicsMedium, isIndoor);
      }
    } else {
      // For photoperiod plants
      const isVeg = i <= vegDuration;
      const isFlower = i > vegDuration && i <= vegDuration + 8;
      const isFlush = i === vegDuration + 9;
      const isHarvest = i === vegDuration + 10;
      
      if (isFlush) {
        weekData.phase = 'Flush Week 1';  // Fixed: Added proper phase label
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else if (isHarvest) {
        weekData.phase = 'Harvest Week';  // Fixed: Added proper phase label
        weekData['pH'] = isSoil ? '6.0–6.5' : generalHydroponicsMedium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
      } else {
        let stageIndex;
        if (isIndoor) {
          // Indoor 4-stage
          if (isVeg) {
            stageIndex = i <= vegDuration / 2 ? 0 : 1; // Early vs Late Growth
          } else {
            const flowerWeek = i - vegDuration;
            stageIndex = flowerWeek <= 4 ? 2 : 3; // Early-Mid vs Late Bloom
          }
        } else {
          // Outdoor 2-stage  
          stageIndex = isVeg ? 0 : 1; // Growth vs Bloom
        }
        
        // Fixed: Add proper phase labels for photoperiod plants
        if (isVeg) {
          weekData.phase = `Vegetative Week ${i}`;
        } else {
          const flowerWeek = i - vegDuration;
          weekData.phase = `Flowering Week ${flowerWeek}`;
        }
        
        addMaxiNutrientData(weekData, chart[stageIndex], generalHydroponicsMedium, isIndoor);
      }
    }
    
    schedule.push(weekData);
  }
  
  return schedule;
}

// Helper function to add Flora Series nutrient data (already in ml/L)
function addFloraSeriesNutrientData(weekData, nutrientData, medium) {
  const isSoil = medium === 'Soil';
  
  if (nutrientData.phase === 'Flush') {
    weekData['pH'] = isSoil ? '6.0–6.5' : medium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
    return;
  }
  
  // Values are already in ml/L - no conversion needed
  weekData['FloraMicro'] = nutrientData.micro;
  weekData['FloraGro'] = nutrientData.gro;
  weekData['FloraBloom'] = nutrientData.bloom;
  
  // Set pH based on medium
  weekData['pH'] = isSoil ? '6.0–6.5' : medium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
  
  // Add EC and TDS for non-soil mediums
  if (!isSoil && nutrientData.ec && nutrientData.ppm) {
    weekData['EC'] = nutrientData.ec;
    weekData['TDS'] = nutrientData.ppm;
  }
}

// FIXED: Updated helper function for MaxiSeries (removed phase assignment since it's now handled above)
function addMaxiNutrientData(weekData, stageData, medium, isIndoor) {
  const isSoil = medium === 'Soil';
  
  if (stageData.maxigro > 0) {
    weekData['MaxiGro'] = stageData.maxigro;
  } else {
    weekData['MaxiBloom'] = stageData.maxibloom;
  }
  
  // Add CALiMAGic for indoor schedules
  if (isIndoor && stageData.calimagic) {
    weekData['CALiMAGic'] = stageData.calimagic;
  }
  
  // Set pH based on medium
  weekData['pH'] = isSoil ? '6.0–6.5' : medium === 'Coco Coir' ? '5.8–6.2' : '5.5–6.0';
  
  // Add EC and TDS for non-soil mediums
  if (!isSoil && stageData.ec && stageData.ppm) {
    weekData['EC'] = stageData.ec;
    weekData['TDS'] = stageData.ppm;
  }
}

// Helper function to map autoflower weeks to chart weeks
function mapAutoWeekToChart(autoWeek, totalWeeks) {
  const progressRatio = autoWeek / totalWeeks;
  
  if (progressRatio <= 0.3) {
    // Early weeks (weeks 1-3)
    return Math.min(Math.ceil(progressRatio * 10), 3);
  } else if (progressRatio <= 0.9) {
    // Main grow period (weeks 4-11)
    return Math.min(4 + Math.floor((progressRatio - 0.3) * 13), 11);
  } else if (progressRatio <= 0.95) {
    // Ripen week
    return 12;
  } else {
    // Flush week
    return 13;
  }
}