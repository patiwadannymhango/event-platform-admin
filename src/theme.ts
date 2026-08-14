import { createTheme, alpha } from '@mui/material/styles';

// Neutral scale matches MUI's own dashboard template (mui.com/material-ui
// design kits) so the light look reads as "real MUI light dashboard"
// rather than an approximation — see
// docs/data/material/getting-started/templates/shared-theme/themePrimitives.ts
// in the mui/material-ui repo for the source of these values.
const gray = {
  50: 'hsl(220, 35%, 97%)',
  100: 'hsl(220, 30%, 94%)',
  200: 'hsl(220, 20%, 88%)',
  300: 'hsl(220, 20%, 80%)',
  400: 'hsl(220, 20%, 65%)',
  600: 'hsl(220, 20%, 35%)',
  800: 'hsl(220, 30%, 6%)',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#D97B3F',
      dark: '#8A4420',
      light: '#F0985A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#B8791E',
    },
    background: {
      default: 'hsl(0, 0%, 99%)',
      paper: '#FFFFFF',
    },
    text: {
      primary: gray[800],
      secondary: gray[600],
    },
    success: { main: '#2E9E5B' },
    error: { main: '#D6423A' },
    divider: alpha(gray[300], 0.6),
    action: {
      hover: alpha(gray[200], 0.4),
      selected: alpha(gray[200], 0.6),
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${alpha(gray[300], 0.6)}`,
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF',
          borderRight: `1px solid ${alpha(gray[300], 0.6)}`,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          backgroundImage: 'none',
          borderBottom: `1px solid ${alpha(gray[300], 0.6)}`,
          color: gray[800],
        },
      },
    },
  },
});
