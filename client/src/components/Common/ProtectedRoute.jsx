import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { Box, Typography, Button } from '@mui/material'
import { LoginOutlined, SecurityOutlined } from '@mui/icons-material'
import LoadingSpinner from './LoadingSpinner'

const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE
const ProtectedRoute = ({
  children,
  requiredRole = null,
  requiredPermission = null,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth0()
  const location = useLocation()

  // Namespace personnalisé pour les claims Auth0 (à adapter à ta config)
  const roles = user?.[`${NAMESPACE}/roles`] || []
  const permissions = user?.[`${NAMESPACE}/permissions`] || []

  const hasRole = (role) => roles.includes(role)
  const hasPermission = (permission) => permissions.includes(permission)

  if (isLoading) {
    return <LoadingSpinner message="Vérification des permissions..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

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
        <Typography variant="h4" color="error.main">
          Accès refusé
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Rôle requis : <strong>{requiredRole}</strong>
        </Typography>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Retour
        </Button>
      </Box>
    );
  }

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
        <Typography variant="h4" color="warning.main">
          Permission insuffisante
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Permission requise : <strong>{requiredPermission}</strong>
        </Typography>
        <Button variant="outlined" onClick={() => window.history.back()}>
          Retour
        </Button>
      </Box>
    );
  }

  return children
};

export default ProtectedRoute
