import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthContextProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [isInitialized, setIsInitialized] = useState(false);
  const [userMetadata, setUserMetadata] = useState(null);

  // Initialiser l'auth quand Auth0 est prêt
  useEffect(() => {
    if (!isLoading) {
      setIsInitialized(true);
    }
  }, [isLoading]);

  // Récupérer les métadonnées utilisateur
  useEffect(() => {
    const getUserMetadata = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const token = await getAccessTokenSilently();
        
        // Appel à ton backend Django pour récupérer les métadonnées
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user-metadata/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const metadata = await response.json();
          setUserMetadata(metadata);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées:', error);
      }
    };

    if (isAuthenticated && user) {
      getUserMetadata();
    }
  }, [isAuthenticated, user]);

  // Fonction de connexion personnalisée
  const login = () => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    });
  };

  // Fonction de déconnexion personnalisée
  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
    setUserMetadata(null);
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    if (!user || !user['https://yourdomain.com/roles']) return false;
    return user['https://yourdomain.com/roles'].includes(role);
  };

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = (permission) => {
    if (!user || !user['https://yourdomain.com/permissions']) return false;
    return user['https://yourdomain.com/permissions'].includes(permission);
  };

  // Obtenir le token d'accès
  const getToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
      return null;
    }
  };

  // Données utilisateur enrichies
  const enrichedUser = user ? {
    ...user,
    metadata: userMetadata,
    displayName: user.name || user.nickname || user.email,
    avatar: user.picture,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
  } : null;

  const value = {
    // États Auth0
    user: enrichedUser,
    isAuthenticated,
    isLoading,
    isInitialized,
    
    // Métadonnées
    userMetadata,
    
    // Actions
    login,
    logout: handleLogout,
    getToken,
    
    // Vérifications
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;