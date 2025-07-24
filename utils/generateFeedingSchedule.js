import { generateBioBizzSchedule } from './generateBioBizzSchedule';
import { generateDutchProSchedule } from './generateDutchProSchedule';
import { generateAdvancedNutrientsSchedule } from './generateAdvancedNutrientsSchedule';

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
    const vegWeeks = parseInt(growData.vegWeeks) || 4; // default to 4 if undefined
    return generateAdvancedNutrientsSchedule(subtype, vegWeeks);
  }

  return [];
};
