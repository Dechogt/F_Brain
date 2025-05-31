import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00E676', // Vert gaming électrique
      light: '#66FF8A',
      dark: '#00C853',
      contrastText: '#000000',
    },
    secondary: {
      main: '#FF6B35', // Orange gaming
      light: '#FF9662',
      dark: '#E55100',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0A0E27', // Bleu très sombre
      paper: '#1A1F3A', // Bleu foncé pour les cartes
    },
    surface: {
      main: '#242B4D', // Surface intermédiaire
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0BEC5',
    },
    error: {
      main: '#FF1744',
    },
    warning: {
      main: '#FFB300',
    },
    info: {
      main: '#00B8D4',
    },
    success: {
      main: '#00E676',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(45deg, #00E676, #00B8D4)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0, 230, 118, 0.3)',
          },
        },
        contained: {
          background: 'linear-gradient(45deg, #00E676, #00B8D4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #00C853, #0097A7)',
          },
        },
        outlined: {
          borderColor: '#00E676',
          color: '#00E676',
          '&:hover': {
            borderColor: '#00C853',
            backgroundColor: 'rgba(0, 230, 118, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#1A1F3A',
          border: '1px solid rgba(0, 230, 118, 0.1)',
          borderRadius: 16,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 20px 40px rgba(0, 230, 118, 0.1)',
            borderColor: 'rgba(0, 230, 118, 0.3)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(26, 31, 58, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 230, 118, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1A1F3A',
          borderRight: '1px solid rgba(0, 230, 118, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#00E676',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00E676',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(0, 230, 118, 0.2)',
          color: '#00E676',
          '&:hover': {
            backgroundColor: 'rgba(0, 230, 118, 0.3)',
          },
        },
      },
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
});

export default theme;