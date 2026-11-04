import { generateBioBizzSchedule } from './generateBioBizzSchedule';
import { generateDutchProSchedule } from './generateDutchProSchedule';
import { generateAdvancedNutrientsSchedule } from './generateAdvancedNutrientsSchedule';
import { generateCannaSchedule } from './generateCannaSchedule';
import { generateGeneralHydroponicsSchedule } from './generateGeneralHydroponicsSchedule';

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
  
  return [];
};