import React from 'react';
import { Box, CircularProgress, Typography, keyframes } from '@mui/material';

// Animation de pulsation pour l'effet gaming
const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation de rotation pour l'effet cyber
const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = ({
  size = 60,
  message = "Chargement...",
  variant = "gaming",
  // Ajoute une prop pour contrôler si c'est un overlay pleine page
  isOverlay = true,
}) => {
  // Styles de base pour le conteneur du spinner
  const spinnerContainerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    // Styles pour l'overlay pleine page
    ...(isOverlay && {
      position: 'fixed', // Positionnement fixe par rapport au viewport
      top: 0,
      left: 0,
      width: '100vw', // Prend toute la largeur du viewport
      height: '100vh', // Prend toute la hauteur du viewport
      backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fond semi-transparent pour masquer le contenu derrière
      zIndex: 9999, // Assure qu'il est au-dessus des autres éléments
    }),
    // Styles si ce n'est PAS un overlay (comportement original)
    ...(!isOverlay && {
      minHeight: '100vh', // Prend au moins la hauteur du viewport
      backgroundColor: 'background.default', // Utilise la couleur de fond du thème
    }),
  };

  return (
    <Box sx={spinnerContainerStyles}> {/* Applique les styles conditionnels */}
      {variant === 'gaming' ? (
        <>
          {/* Cercle extérieur animé */}
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Cercle de fond */}
            <Box
              sx={{
                width: size + 20,
                height: size + 20,
                borderRadius: '50%',
                border: '2px solid rgba(0, 230, 118, 0.2)',
                animation: `${rotate} 3s linear infinite`,
                position: 'absolute',
              }}
            />

            {/* Cercle principal */}
            <CircularProgress
              size={size}
              thickness={4}
              sx={{
                color: 'primary.main',
                animation: `${pulse} 2s ease-in-out infinite`,
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                },
              }}
            />

            {/* Point central */}
            <Box
              sx={{
                position: 'absolute',
                width: 8,
                height: 8,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                animation: `${pulse} 1s ease-in-out infinite`,
              }}
            />
          </Box>

          {/* Texte de chargement */}
          <Typography
            variant="h6"
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              textAlign: 'center',
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            {message}
          </Typography>

          {/* Points animés */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[0, 1, 2].map((index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: 'primary.main',
                  borderRadius: '50%',
                  animation: `${pulse} 1.5s ease-in-out infinite`,
                  animationDelay: `${index * 0.3}s`,
                }}
              />
            ))}
          </Box>
        </>
      ) : (
        <>
          <CircularProgress size={size} sx={{ color: 'primary.main' }} />
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </>
      )}
    </Box>
  );
};

// Variante pour les petits loadings dans les composants
export const MiniLoader = ({ size = 24 }) => (
  <CircularProgress
    size={size}
    thickness={4}
    sx={{
      color: 'primary.main',
      '& .MuiCircularProgress-circle': {
        strokeLinecap: 'round',
      },
    }}
  />
);

export default LoadingSpinner;