import { generateBioBizzSchedule } from './charts/biobizz';
import { generateDutchProSchedule } from './charts/dutchpro';
import { generateAdvancedNutrientsSchedule } from './charts/advancednutrients';
import { generateAdvancedNutrientsSchedule as legacyAN } from './generateAdvancedNutrientsSchedule';
import { AN_LINES } from './charts/advancednutrients';
import { generateCannaSchedule } from './generateCannaSchedule';
import { generateGeneralHydroponicsSchedule } from './generateGeneralHydroponicsSchedule';
import { generateChartSchedule } from './generateChartSchedule';
import { PLAGRON_LINES } from './charts/plagron';

export const generateFeedingSchedule = (growData) => {
  const { nutrients } = growData;
  
  if (nutrients === 'BioBizz') {
    return generateBioBizzSchedule(growData);
  }
  
  if (nutrients === 'DutchPro') {
    return generateDutchProSchedule(growData);
  }
  
  if (nutrients === 'AdvancedNutrients') {
    if (AN_LINES[growData.advancedNutrientsLine]) return generateAdvancedNutrientsSchedule(growData);
    // Connoisseur Coco: official chart not verified yet, keep the old plan for now
    return legacyAN(growData.advancedNutrientsLine || '', parseInt(growData.vegWeeks, 10) || 4, growData.type);
  }
  
  if (nutrients === 'CANNA') {
    return generateCannaSchedule(growData);
  }
  
  if (nutrients === 'GeneralHydroponics') {
    return generateGeneralHydroponicsSchedule(growData);
  }

  if (nutrients === 'Plagron') {
    return generateChartSchedule(PLAGRON_LINES[growData.plagronLine], growData);
  }
  
  return [];
};