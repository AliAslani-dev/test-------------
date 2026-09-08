import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    border: {
      default: string;
    };
  }

  interface PaletteOptions {
    border?: {
      default?: string;
    };
  }
}

const theme = createTheme({
  typography: {
    fontFamily: 'IranYekan, sans-serif',
  },
  palette: {
    border: {
      default: '#E7E6E6',
    },
  },

  components: {
    MuiButton: {},
  },
});

export default theme;
