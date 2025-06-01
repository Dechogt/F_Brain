import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { LoginOutlined, SecurityOutlined } from '@mui/icons-material';
import { useAuth } from '../contexts';
import { LoadingSpinner } from './LoadingSpinner';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null 
}) => {
  const { user, isAuthenticated, isLoading, login, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Chargement en cours
  if (isLoading) {
    return <LoadingSpinner message="Vérification des permissions..." />;
  }

  // Non authentifié - redirection vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Vérification du rôle requis
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <SecurityOutlined sx={{ fontSize: 80, color: 'error.main' }} />
        <Typography variant="h4" color="error.main" gutterBottom>
          Accès refusé
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          Rôle requis : <strong>{requiredRole}</strong>
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.history.back()}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  // Vérification de la permission requise
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <SecurityOutlined sx={{ fontSize: 80, color: 'warning.main' }} />
        <Typography variant="h4" color="warning.main" gutterBottom>
          Permission insuffisante
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
          Vous n'avez pas la permission nécessaire pour cette action.
          Permission requise : <strong>{requiredPermission}</strong>
        </Typography>
        <Button
          variant="outlined"
          onClick={() => window.history.back()}
          sx={{ mt: 2 }}
        >
          Retour
        </Button>
      </Box>
    );
  }

  // Utilisateur authentifié et autorisé
  return children;
};

// Composant pour afficher la page de login avec redirection
export const LoginRequired = () => {
  const { login } = useAuth();
  const location = useLocation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        gap: 3,
      }}
    >
      <LoginOutlined sx={{ fontSize: 80, color: 'primary.main' }} />
      <Typography variant="h4" color="primary.main" gutterBottom>
        Connexion requise
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400 }}>
        Vous devez être connecté pour accéder à cette page.
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => login()}
        startIcon={<LoginOutlined />}
        sx={{ mt: 2 }}
      >
        Se connecter
      </Button>
    </Box>
  );
};

export default ProtectedRoute;