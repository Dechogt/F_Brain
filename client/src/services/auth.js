import { useAuth0 } from '@auth0/auth0-react';

/**
 * Hook d'assistance pour extraire les rôles et permissions d'un utilisateur
 * Basé sur des claims personnalisés dans Auth0
 */
export const useAuthData = () => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout, getAccessTokenSilently } = useAuth0();
  const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE
  const roles = user?.[`${NAMESPACE}/roles`] || [];
  const permissions = user?.[`${NAMESPACE}/permissions`] || [];

  const hasRole = (role) => roles.includes(role);
  const hasPermission = (permission) => permissions.includes(permission);

  return {
    user,
    roles,
    permissions,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    hasRole,
    hasPermission,
  };
};
