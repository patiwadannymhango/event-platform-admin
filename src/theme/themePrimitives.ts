import type { PaletteMode, ThemeOptions } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';

// Material Design 2 palette tuned around Copper Belt Marathon's copper
// brand color, with the standard MD2 gray/green/amber/red ramps used
// across the MUI dashboard template (status chips, charts, hover states).
// Mirrors the simplified theme approach used by siavonga-independence-main-admin.

export const brand = {
  50: '#fdf2e9',
  100: '#f9dfc4',
  200: '#f0bd85',
  300: '#e0954f',
  400: '#c97a35',
  main: '#a8571a',
  500: '#a8571a',
  600: '#8a4715',
  700: '#6d3811',
  800: '#502a0d',
  900: '#331b08',
};

export const gray = {
  50: '#fafafa',
  100: '#f4f5f7',
  200: '#e6e8ec',
  300: '#d3d7de',
  400: '#a9afbc',
  500: '#7c8494',
  600: '#5a6272',
  700: '#3d4451',
  800: '#252a33',
  900: '#14171c',
};

export const green = { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', bg: '#e8f5e9' };
export const orange = { main: '#ed6c02', light: '#ff9800', dark: '#c65a00', bg: '#fff3e0' };
export const red = { main: '#d32f2f', light: '#ef5350', dark: '#b71c1c', bg: '#fdecea' };
export const teal = { main: '#00897b', light: '#26a69a', dark: '#00695c', bg: '#e0f2f1' };

export function getDesignTokens(mode: PaletteMode): ThemeOptions {
  return {
    palette: {
      mode,
      primary: {
        main: brand.main,
        light: brand[300],
        dark: brand[700],
        contrastText: '#fff',
      },
      secondary: {
        main: teal.main,
        contrastText: '#fff',
      },
      success: { main: green.main, light: green.light, dark: green.dark },
      warning: { main: orange.main, light: orange.light, dark: orange.dark },
      error: { main: red.main, light: red.light, dark: red.dark },
      info: { main: brand[400] },
      divider: mode === 'dark' ? alpha(gray[600], 0.4) : gray[200],
      background:
        mode === 'dark'
          ? { default: '#0e1117', paper: '#161a21' }
          : { default: gray[50], paper: '#ffffff' },
      text:
        mode === 'dark'
          ? { primary: '#f4f5f7', secondary: gray[400] }
          : { primary: gray[900], secondary: gray[600] },
    },
    typography: {
      // Mirrors siavonga-independence-main-admin's brand font (see its
      // index.html Google Fonts link and index.css --font-mono).
      fontFamily: [
        '"JetBrains Mono"',
        'ui-monospace',
        '"SF Mono"',
        'Menlo',
        'Consolas',
        'monospace',
      ].join(','),
      h1: { fontSize: '2.25rem', fontWeight: 600, lineHeight: 1.2 },
      h2: { fontSize: '1.875rem', fontWeight: 600, lineHeight: 1.2 },
      h3: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.35 },
      h5: { fontSize: '1.0625rem', fontWeight: 600 },
      h6: { fontSize: '0.95rem', fontWeight: 600 },
      subtitle1: { fontSize: '0.925rem', fontWeight: 500 },
      subtitle2: { fontSize: '0.8125rem', fontWeight: 500 },
      body1: { fontSize: '0.925rem' },
      body2: { fontSize: '0.825rem' },
      caption: { fontSize: '0.75rem' },
    },
    shape: { borderRadius: 10 },
    spacing: 8,
  };
}
