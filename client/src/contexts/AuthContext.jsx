import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

// Crée le contexte
export const AuthContext = createContext()

// Configuration de l'API (utilise import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost' 
const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE

// Composant fournisseur d'authentification
export const AuthProvider = ({ children }) => { 
  const {
    user,
    isAuthenticated,
    isLoading: auth0Loading, // Renommé pour éviter conflit
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error: auth0Error, // Ajout de l'erreur Auth0
  } = useAuth0()

  // État pour le token API
  const [apiToken, setApiToken] = useState(null)
  // État pour les données du profil Gamer de ton backend
  const [userProfile, setUserProfile] = useState(null)
  // État de chargement combiné (Auth0 + appel API)
  const [loading, setLoading] = useState(true) // Commence à true car Auth0 charge au début
  // État d'erreur combiné (Auth0 + appel API)
  const [error, setError] = useState(null)

  // --- Intercepteur Axios ---
  // Cet intercepteur ajoute le token aux requêtes sortantes
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Ajoute le token seulement si l'utilisateur est authentifié et que le token est disponible
        // et si l'URL de la requête commence par l'URL de base de ton API
        if (isAuthenticated && apiToken && config.url?.startsWith(API_BASE_URL + '/api')) { 
          config.headers.Authorization = `Bearer ${apiToken}`
          console.log('AuthContext: Token ajouté aux headers:', apiToken.substring(0, 20) + '...')
        }
        return config;
      },
      (error) => Promise.reject(error)
    )

    // Cet intercepteur gère les réponses 401
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Si la réponse est 401 et que l'utilisateur est authentifié
        if (error.response?.status === 401 && isAuthenticated) {
          console.log('AuthContext: Réponse 401 reçue. Tentative de renouvellement du token...')
          try {
            // Tente d'obtenir un nouveau token (Auth0 gère le rafraîchissement si possible)
            const freshToken = await getAccessTokenSilently({
               // Ajoute l'audience si définie
               ...(import.meta?.env?.VITE_AUTH0_AUDIENCE && {
                 audience: import.meta.env.VITE_AUTH0_AUDIENCE
               }),
               // scope: 'read:user read:profile' // Ajoute les scopes si nécessaire
            })

            if (freshToken) {
              console.log('AuthContext: Token renouvelé avec succès.')
              setApiToken(freshToken) 

              // Retry la requête originale avec le nouveau token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${freshToken}`
              // Important: Ne pas laisser l'intercepteur se déclencher à nouveau pour cette requête retry
              originalRequest._retry = true; // Marque la requête comme retry
              return axios.request(originalRequest);
            } else {
              console.error('AuthContext: getAccessTokenSilently n\'a pas renvoyé de nouveau token.')
              throw new Error('AuthContext: Impossible de renouveler le token.')
            }

          } catch (refreshError) {
            console.error('AuthContext: Échec du renouvellement ou du retry:', refreshError)
            // Si le renouvellement échoue, la session est probablement invalide
            handleLogout() // Déconnexion forcée
            // Propage l'erreur pour qu'elle soit gérée par le code appelant
            return Promise.reject(refreshError)
          }
        }
        // Pour les autres erreurs ou si l'utilisateur n'est pas authentifié, propage l'erreur
        return Promise.reject(error)
      }
    );

    // Nettoyage des intercepteurs
    return () => {
      axios.interceptors.request.eject(requestInterceptor)
      axios.interceptors.response.eject(responseInterceptor)
    }
  }, [apiToken, isAuthenticated, getAccessTokenSilently, logout]); // Dépendances des intercepteurs


  // --- Fonction pour obtenir et définir le token initial ---
  const getAndSetToken = useCallback(async () => {
    // Obtient le token seulement si l'utilisateur est authentifié et que Auth0 a fini de charger
    if (!isAuthenticated || auth0Loading) {
        setApiToken(null) // Réinitialise le token si non authentifié ou Auth0 charge
        return
    }

    try {
      console.log('AuthContext: Tentative d\'obtention et définition du token initial...')
      const tokenOptions = {
        audience: import.meta?.env?.VITE_AUTH0_AUDIENCE || 'http://localhost/api',
        scope: 'openid profile email', // Scopes de base
        // Ajoute les scopes de ton API si nécessaire
        // scope: 'openid profile email read:user read:profile',
      }

      const token = await getAccessTokenSilently(tokenOptions);
      if (token) {
        console.log('AuthContext: Token initial obtenu et défini.')
        setApiToken(token)
      } else {
         console.warn('AuthContext: Token initial vide.')
         setApiToken(null)
      }
    } catch (err) {
      console.error('AuthContext: Erreur lors de l\'obtention du token initial:', err)
      // Gérer l'erreur (ex: afficher un message, déconnecter)
      setError(new Error('AuthContext: Impossible d\'obtenir le token initial.'))
      setApiToken(null);
    }
  }, [isAuthenticated, auth0Loading, getAccessTokenSilently])

  // --- Effet pour obtenir le token initial quand l'état d'authentification change ---
  useEffect(() => {
    getAndSetToken()
  }, [getAndSetToken])

  const fetchUserProfile = useCallback(async () => {
    // Récupère le profil seulement si l'utilisateur est authentifié et que le token API est disponible
    if (!isAuthenticated || !apiToken) {
        setUserProfile(null) // Réinitialise le profil si non authentifié ou pas de token
        return
    }

    try {
      console.log('AuthContext: Appel API /user/ pour profil utilisateur...')
      
      // Assumes VITE_API_BASE_URL est l'origine (ex: http://localhost)
      const apiUrl = `${API_BASE_URL}/user/`

      // Axios utilisera automatiquement l'intercepteur pour ajouter le header Authorization
      const response = await axios.get(apiUrl, {
         timeout: 10000 // Délai d'attente pour la réponse API
      });

      console.log('AuthContext: Profil utilisateur récupéré:', response.data)
      setUserProfile(response.data)
      setError(null)

    } catch (err) {
      console.error('AuthContext: Erreur lors de la récupération du profil utilisateur:', err)
      // L'intercepteur gère déjà les 401. Gérer les autres erreurs ici.
      if (err.response?.status === 404) {
         setError(new Error('AuthContext: Profil utilisateur non trouvé dans le backend.'))
      } else if (err.response?.status === 500) {
         setError(new Error('AuthContext: Erreur serveur lors de la récupération du profil.'))
      } else if (err.code === 'ECONNABORTED') {
         setError(new Error('AuthContext: Délai d\'attente de récupération du profil dépassé.'))
      } else {
         setError(err)
      }
      setUserProfile(null)
    }
  }, [isAuthenticated, apiToken])


  // --- Effet pour récupérer le profil utilisateur quand le token est disponible ---
  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile]) 


  // Fonction de déconnexion personnalisée
  const handleLogout = useCallback(() => {
    console.log('AuthContext: Déconnexion...')
    setApiToken(null) 
    setUserProfile(null) 
    setError(null) 
    logout({ returnTo: window.location.origin }) // Déconnexion via Auth0
  }, [logout]) 


  // Vérifier si l'utilisateur a un rôle spécifique (utilise l'objet user d'Auth0)
  const hasRole = useCallback((role) => {
    if (!user || !user[`${NAMESPACE}/roles`]) return false
    return user[`${NAMESPACE}/roles`].includes(role)
  }, [user, NAMESPACE])

  // Vérifier si l'utilisateur a une permission spécifique (utilise l'objet user d'Auth0)
  const hasPermission = useCallback((permission) => {
    if (!user || !user[`${NAMESPACE}/permissions`]) return false
    return user[`${NAMESPACE}/permissions`].includes(permission)
  }, [user, NAMESPACE])

  // Obtenir le token d'accès (expose la fonction getAccessTokenSilently)
  const getToken = useCallback(async () => {
     // Utilise getAccessTokenSilently directement
     const tokenOptions = {
       audience: import.meta?.env?.VITE_AUTH0_AUDIENCE || 'http://localhost/api',
       scope: 'openid profile email', // Scopes de base
       // Ajoute les scopes de ton API si nécessaire
       // scope: 'openid profile email read:user read:profile',
     };
     try {
        return await getAccessTokenSilently(tokenOptions)
     } catch (err) {
        console.error('AuthContext: Erreur lors de l\'obtention du token via getToken:', err)
        throw err
     }
  }, [getAccessTokenSilently])


  // Fonction pour faire un appel API sécurisé (utilise l'intercepteur)
  const secureApiCall = useCallback(async (url, options = {}) => {
    // L'intercepteur gère déjà l'ajout du token et le renouvellement en cas de 401
    try {
       const response = await axios({
         url: `${API_BASE_URL}${url}`, 
         ...options, 
         headers: {
           'Content-Type': 'application/json',
           ...options.headers 
         },
       })
       return response.data
    } catch (err) {
       console.error('AuthContext: Erreur lors de l\'appel secureApiCall:', err)
      
       throw err 
    }
  }, []) 

  const enrichedUser = user ? {
    ...user, 
    ...userProfile, 

    // Ajoute les propriétés calculées basées sur les données combinées
    displayName: userProfile?.pseudo || user.name || user.nickname || user.email, 
    avatar: userProfile?.avatar || user.picture, 
    isAdmin: hasRole('admin'), 
    isModerator: hasRole('moderator'), 

    level: userProfile?.level,
    points: userProfile?.points,
    topGames: userProfile?.topGames,
    favoriteGame: userProfile?.favoriteGame,

  } : null

  const combinedLoading = auth0Loading || loading

  const combinedError = auth0Error || error

  // Valeurs exposées par le contexte
  const contextValue = {
    // États combinés
    user: enrichedUser, 
    isAuthenticated, 
    isLoading: combinedLoading, 
    error: combinedError, 

    // Données du profil Gamer 
    userProfile,

    // Actions Auth0 de base
    loginWithRedirect, 
    logout: handleLogout, 

    // Fonctions utilitaires
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
  )
}

export const useAuth = () => { 
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}