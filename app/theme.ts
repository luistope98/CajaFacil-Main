'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'var(--font-inter), sans-serif',
    h1: {
      fontFamily: 'var(--font-inter), sans-serif',
      fontWeight: 300,
      fontSize: '48px',
      lineHeight: '100%',
      letterSpacing: '0px',
    },
  },
  palette: {
    primary: {
      main: '#0B5FFF',
      dark: '#0747C6',
    },
    success: {
      main: '#15803D',
    },
    error: {
      main: '#C5161D',
      dark: '#A11218',
    },
    text: {
      secondary: '#6B7280',
    },
    grey: {
      50: '#F9FAFB',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;