import React, { createContext, useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const AuthContext = createContext()

export const AuthContextProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0()

  const [appUserData, setAppUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE

  const fetchAppUserData = useCallback(async () => {
    if (auth0Error) {
      setError(auth0Error)
      setLoading(false)
      setAppUserData(null)
      return;
    }

    if (auth0Loading || !isAuthenticated || !user?.sub) {
      if (!isAuthenticated) {
         setLoading(false)
         setAppUserData(null)
         setError(null)
      }
      return
    }

    try {
      setLoading(true)
      setError(null)

      let token
      try {
        const tokenOptions = { /* ... */ }
        const audience = import.meta?.env?.VITE_AUTH0_AUDIENCE
        if (audience) { tokenOptions.audience = audience }

        console.log('AuthContext: Tentative d\'obtention du token avec options:', tokenOptions)
        token = await getAccessTokenSilently(tokenOptions)

        if (!token) {
          throw new Error('AuthContext: Token vide reçu de Auth0')
        }
        console.log('AuthContext: Token obtenu avec succès')

      } catch (tokenError) {
        console.error('AuthContext: Erreur lors de l\'obtention du token:', tokenError)
        setError(new Error('AuthContext: Impossible d\'obtenir le token d\'accès Auth0'))
        setLoading(false)
        setAppUserData(null);
        return; // Arrête l'exécution si le token n'est pas obtenu
      }

      // Faire la requête vers l'API backend
      try {
        console.log('AuthContext: Appel API /user/ avec token')
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/user/`

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000
        });

        console.log('AuthContext: Données utilisateur reçues:', response.data)
        setAppUserData(response.data)

      } catch (apiError) {
        console.error('AuthContext: Erreur lors de l\'appel API backend:', apiError)

        if (apiError.response?.status === 401) {
           console.warn('AuthContext: API backend renvoie 401 Unauthorized')
           setError(new Error('AuthContext: Accès API non autorisé.'))
        } else if (apiError.response?.status === 404) {
           console.warn('AuthContext: API backend renvoie 404 Not Found')
           setError(new Error('AuthContext: Endpoint API utilisateur non trouvé.'))
        } else if (apiError.response?.status === 500) {
           console.warn('AuthContext: API backend renvoie 500 Internal Server Error')
           setError(new Error('AuthContext: Erreur serveur lors de la récupération des données utilisateur.'))
        } else if (apiError.code === 'ECONNABORTED') {
           setError(new Error('AuthContext: Délai d\'attente de l\'API dépassé.'))
        } else {
           setError(apiError)
        }

        setAppUserData(null)
        
      }

    } catch (err) {
      // Ce bloc attrape les erreurs qui ne sont pas gérées dans les blocs catch imbriqués
      console.error('AuthContext: Erreur inattendue dans fetchAppUserData:', err)
      setError(err)
      setAppUserData(null)
    } finally { // --- Bloc finally principal ---
      // Ce bloc s'exécute toujours
      setLoading(false)
    }

  }, [
    auth0Loading,
    isAuthenticated,
    user,
    auth0Error,
    getAccessTokenSilently,
  ])

  useEffect(() => {
    fetchAppUserData()
  }, [fetchAppUserData])

  // Fonction de connexion personnalisée
  const login = useCallback(() => {
    loginWithRedirect({
      appState: {
        returnTo: window.location.pathname,
      },
    })
  }, [loginWithRedirect])

  const handleLogout = useCallback(() => { 
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    })
    setAppUserData(null)
    setError(null)
  }, [logout])


  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = useCallback((role) => {
    if (!user || !user[`${NAMESPACE}/roles`]) return false
    return user[`${NAMESPACE}/roles`].includes(role)
  }, [user, NAMESPACE])

  // Vérifier si l'utilisateur a une permission spécifique
  const hasPermission = useCallback((permission) => {
    if (!user || !user[`${NAMESPACE}/permissions`]) return false
    return user[`${NAMESPACE}/permissions`].includes(permission)
  }, [user, NAMESPACE])

  // Obtenir le token d'accès
  const getToken = useCallback(async () => {
    try {
      const tokenOptions = { /* ... */ }
      const audience = import.meta?.env?.VITE_AUTH0_AUDIENCE
      if (audience) { tokenOptions.audience = audience }

      return await getAccessTokenSilently(tokenOptions)
    } catch (error) {
      console.error('AuthContext: Erreur lors de la récupération du token:', error)
      return null
    }
  }, [getAccessTokenSilently])

  // Données utilisateur enrichies
  const enrichedUser = user ? {
    ...user,
    ...appUserData,

    displayName: appUserData?.pseudo || user.name || user.nickname || user.email,
    avatar: appUserData?.avatar || user.picture,
    isAdmin: hasRole('admin'),
    isModerator: hasRole('moderator'),
    level: appUserData?.level,
    points: appUserData?.points,
    topGames: appUserData?.topGames,
    favoriteGame: appUserData?.favoriteGame,

  } : null;

  const value = {
    user: enrichedUser,
    isAuthenticated,
    isLoading: auth0Loading || loading,
    // isInitialized, // Redondant

    appUserData,

    login,
    logout: handleLogout,
    getToken,
    hasRole,
    hasPermission,

    error: auth0Error || error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext