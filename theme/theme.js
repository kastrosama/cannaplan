// theme.js — CannaPlan design tokens and theme provider.
// Dark is the default ("tent mode"); light is optional and saved in settings.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'settings_theme';
const UNITS_KEY = 'settings_units';

const phaseDark = {
  veg: '#5FBF77',
  flower: '#E8A33D',
  flush: '#4FA3D9',
  harvest: '#B98A5E',
};

// Deeper tones so labels stay readable on light backgrounds.
const phaseLight = {
  veg: '#2F8A48',
  flower: '#B86E0C',
  flush: '#2476B0',
  harvest: '#85603C',
};

export const palettes = {
  dark: {
    mode: 'dark',
    bg: '#0D1411',
    surface: '#151F1A',
    surfaceAlt: '#1C2822',
    border: '#253229',
    text: '#EAF2EC',
    textMuted: '#93A79B',
    textFaint: '#5E7166',
    accent: '#9BD65A',
    accentSoft: 'rgba(155, 214, 90, 0.14)',
    onAccent: '#0D1411',
    danger: '#E8644F',
    dangerSoft: 'rgba(232, 100, 79, 0.14)',
    logoTile: '#FFFFFF',
    phase: phaseDark,
  },
  light: {
    mode: 'light',
    bg: '#F3F6F1',
    surface: '#FFFFFF',
    surfaceAlt: '#EBF0E8',
    border: '#DCE4D8',
    text: '#14201A',
    textMuted: '#5A6B61',
    textFaint: '#94A39A',
    accent: '#3F8A2E',
    accentSoft: 'rgba(63, 138, 46, 0.12)',
    onAccent: '#FFFFFF',
    danger: '#C8442F',
    dangerSoft: 'rgba(200, 68, 47, 0.10)',
    logoTile: '#FFFFFF',
    phase: phaseLight,
  },
};

export const fonts = {
  brand: 'LemonMilk',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 8, md: 12, lg: 16, pill: 999 };

const ThemeContext = createContext({
  theme: palettes.dark,
  preference: 'dark',
  setPreference: () => {},
  units: 'metric',
  setUnits: () => {},
});

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [preference, setPref] = useState('dark'); // 'dark' | 'light' | 'system'

  const [units, setUnitsState] = useState('metric'); // 'metric' | 'us'

  useEffect(() => {
    AsyncStorage.multiGet([SETTINGS_KEY, UNITS_KEY])
      .then(([[, t], [, u]]) => {
        if (t) setPref(t);
        if (u) setUnitsState(u);
      })
      .catch(() => {});
  }, []);

  const setUnits = (value) => {
    setUnitsState(value);
    return AsyncStorage.setItem(UNITS_KEY, value).catch(() => {});
  };

  const setPreference = (value) => {
    setPref(value);
    AsyncStorage.setItem(SETTINGS_KEY, value).catch(() => {});
  };

  const resolved = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo(
    () => ({ theme: palettes[resolved], preference, setPreference, units, setUnits }),
    [resolved, preference, units]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);

// Build a StyleSheet from the current theme, recomputed only when the theme changes.
export const useStyles = (factory) => {
  const { theme } = useTheme();
  return useMemo(() => factory(theme), [theme]);
};
