// brands.js — display names and logos for supported nutrient brands.

export const BRANDS = [
  { id: 'BioBizz', name: 'BioBizz', route: 'Create Grow BioBizz', logo: require('../assets/nutrienticons/biobizz.jpeg'), tagline: 'Organic · soil & coco' },
  { id: 'DutchPro', name: 'Dutch Pro', route: 'Create Grow DutchPro', logo: require('../assets/nutrienticons/dutchpro.jpeg'), tagline: 'Mineral · hard & soft water' },
  { id: 'AdvancedNutrients', name: 'Advanced Nutrients', route: 'Create Grow AdvancedNutrients', logo: require('../assets/nutrienticons/advancednutrients.jpg'), tagline: 'pH Perfect & organics' },
  { id: 'CANNA', name: 'CANNA', route: 'Create Grow CANNA', logo: require('../assets/nutrienticons/canna.jpg'), tagline: 'Terra · Coco · Aqua · Hydro' },
  { id: 'GeneralHydroponics', name: 'General Hydroponics', route: 'Create Grow GeneralHydroponics', logo: require('../assets/nutrienticons/generalhydroponics.jpg'), tagline: 'Flora, Maxi, BioThrive, FloraNova' },
];

export const brandById = (id) => BRANDS.find((b) => b.id === id);
export const brandName = (id) => brandById(id)?.name || id || '—';
