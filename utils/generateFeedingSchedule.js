import { generateBioBizzSchedule } from './charts/biobizz';
import { generateDutchProSchedule } from './charts/dutchpro';
import { generateAdvancedNutrientsSchedule } from './generateAdvancedNutrientsSchedule';
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
    const subtype = growData.advancedNutrientsLine;
    const vegWeeks = parseInt(growData.vegWeeks) || 4;
    const type = growData.type; // Add this line
    return generateAdvancedNutrientsSchedule(subtype, vegWeeks, type); // Add type parameter
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