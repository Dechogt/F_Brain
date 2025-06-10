import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

export const AuthContext = createContext()

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost'
const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE;

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Variable pour suivre les requêtes en cours de retry
const retryQueue = new Map()

// Intercepteur de requête pour ajouter le token
api.interceptors.request.use(
  async (config) => {
    const { isAuthenticated, getAccessTokenSilently } = useAuth0()// Accès au hook ici

    // Ajoute le token seulement si l'utilisateur est authentifié
    // et si l'URL de la requête commence par l'URL de base de ton API
    // et si ce n'est pas une requête de retry (pour éviter les boucles)
    if (isAuthenticated && config.url?.startsWith(API_BASE_URL + '/api') && !config._retry) {
      try {
        // Obtient le token silencieusement. Auth0 gère le rafraîchissement si nécessaire.
        const token = await getAccessTokenSilently({
          ...(import.meta?.env?.VITE_AUTH0_AUDIENCE && {
            audience: import.meta.env.VITE_AUTH0_AUDIENCE,
          }),
          // scope: 'openid profile email read:user read:profile', // Ajoute les scopes si nécessaire
        });

        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        } else {
           // Si pas de token, la requête échouera avec 401, ce qui est attendu pour les routes protégées
           console.warn('AuthContext: getAccessTokenSilently n\'a pas renvoyé de token pour la requête.')
        }
      } catch (err) {
        console.error('AuthContext: Erreur lors de l\'obtention du token dans l\'intercepteur de requête:', err)
        // Laisse la requête continuer, elle échouera probablement avec 401
      }
    }
    return config
  },
  (error) => Promise.reject(error)
);

// Intercepteur de réponse pour gérer les 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Évite les boucles de retry infinies
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Marque la requête comme retry

      try {
        // Tente d'obtenir un nouveau token. L'intercepteur de requête le fera automatiquement.
        // On rejoue simplement la requête originale.
        console.log('AuthContext: Réponse 401 reçue. Tentative de rejouer la requête avec un nouveau token...')

        // Rejoue la requête originale en utilisant l'instance axios configurée
        // L'intercepteur de requête ajoutera le nouveau token
        const response = await api.request(originalRequest)
        console.log('AuthContext: Requête rejouée avec succès.')
        return response

      } catch (retryError) {
        console.error('AuthContext: Échec du retry de la requête après 401:', retryError)
        // Si le retry échoue, propage l'erreur
        return Promise.reject(retryError)
      }
    }

    // Pour les autres erreurs ou si c'est déjà une requête retry, propage l'erreur
    return Promise.reject(error)
  }
)

export const AuthProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0()

  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Effet pour gérer l'état de chargement global
  useEffect(() => {
    // Le chargement global est terminé quand Auth0 a fini de charger
    // et que la première tentative de récupération du profil utilisateur est faite
    // (même si elle échoue avec 401, le spinner doit s'arrêter)
    if (!auth0Loading) {
        setLoading(false)
    }
  }, [auth0Loading])


  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated) {
        setUserProfile(null)
        return
    }

    try {
      console.log('AuthContext: Appel API /user/ pour profil utilisateur...')
      // Utilise l'instance axios configurée avec les intercepteurs
      const response = await api.get('/api/user/', {
         timeout: 10000
      });

      console.log('AuthContext: Profil utilisateur récupéré:', response.data)
      setUserProfile(response.data)
      setError(null)

    } catch (err) {
      console.error('AuthContext: Erreur lors de la récupération du profil utilisateur:', err)
      // L'intercepteur gère déjà les 401 et retries.
      // Gérer les autres erreurs ici (404, 500, timeout, etc.)
      if (err.response?.status === 404) {
         setError(new Error('AuthContext: Profil utilisateur non trouvé dans le backend.'))
      } else if (err.response?.status === 500) {
         setError(new Error('AuthContext: Erreur serveur lors de la récupération du profil.'))
      } else if (err.code === 'ECONNABORTED') {
         setError(new Error('AuthContext: Délai d\'attente de récupération du profil dépassé.'))
      } else if (err.response?.status !== 401) { // Évite de définir une erreur si c'est un 401 géré par l'intercepteur
         setError(err)
      }
      setUserProfile(null)
    }
  }, [isAuthenticated])


  // Effet pour récupérer le profil utilisateur quand l'utilisateur s'authentifie
  useEffect(() => {
    if (isAuthenticated) {
        fetchUserProfile()
    } else {
        setUserProfile(null) // Réinitialise le profil si déconnecté
    }
  }, [isAuthenticated, fetchUserProfile])


  const handleLogout = useCallback(() => {
    console.log('AuthContext: Déconnexion...')
    setUserProfile(null);
    setError(null)
    logout({ returnTo: window.location.origin })
  }, [logout])


  const hasRole = useCallback((role) => {
    if (!user || !user[`${NAMESPACE}/roles`]) return false;
    return user[`${NAMESPACE}/roles`].includes(role);
  }, [user, NAMESPACE])

  const hasPermission = useCallback((permission) => {
    if (!user || !user[`${NAMESPACE}/permissions`]) return false
    return user[`${NAMESPACE}/permissions`].includes(permission)
  }, [user, NAMESPACE])

  const getToken = useCallback(async () => {
     const tokenOptions = {
       audience: import.meta?.env?.VITE_AUTH0_AUDIENCE || 'http://localhost/api',
       scope: 'openid profile email',
     };
     try {
        return await getAccessTokenSilently(tokenOptions);
     } catch (err) {
        console.error('AuthContext: Erreur lors de l\'obtention du token via getToken:', err);
        throw err;
     }
  }, [getAccessTokenSilently])


  const secureApiCall = useCallback(async (url, options = {}) => {
    try {
       // Utilise l'instance axios configurée
       const response = await api({
         url: `/api${url}`, 
         ...options,
         headers: {
           'Content-Type': 'application/json',
           ...options.headers
         },
       });
       return response.data;
    } catch (err) {
       console.error('AuthContext: Erreur lors de l\'appel secureApiCall:', err)
       throw err;
    }
  }, []);

  const enrichedUser = user ? {
    ...user,
    ...userProfile,

    displayName: userProfile?.pseudo || user.name || user.nickname || user.email,
    avatar: userProfile?.avatar || user.picture,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),

    level: userProfile?.level,
    points: userProfile?.points,
    topGames: userProfile?.topGames,
    favoriteGame: userProfile?.favoriteGame,

  } : null;

  const combinedLoading = auth0Loading || loading

  const combinedError = auth0Error || error

  const contextValue = {
    user: enrichedUser,
    isAuthenticated,
    isLoading: combinedLoading,
    error: combinedError,

    userProfile,

    loginWithRedirect,
    logout: handleLogout,

    getToken,
    secureApiCall,
    hasRole,
    hasPermission,
    clearError: () => setError(null),
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}