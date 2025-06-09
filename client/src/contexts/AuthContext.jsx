import React, { createContext, useState, useEffect, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios' 

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const {
    user,
    isAuthenticated,
    isLoading: auth0Loading, // Renommé pour éviter conflit avec l'état local 'loading'
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [isInitialized, setIsInitialized] = useState(false) // Cet état pourrait être redondant si tu utilises 'loading'
  const [appUserData, setAppUserData] = useState(null) // Renommé pour clarifier que ce sont les données de ton app/backend
  const [loading, setLoading] = useState(true) // État de chargement pour l'appel API backend
  const [error, setError] = useState(null) // État d'erreur pour l'appel API backend

  const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE // Assure-toi que cette variable est définie

  // Initialiser l'auth quand Auth0 est prêt
  useEffect(() => {
    if (!auth0Loading) {
      setIsInitialized(true); // Cet état pourrait être redondant
    }
  }, [auth0Loading]);

  // Utiliser useCallback pour mémoriser la fonction
  const fetchAppUserData = useCallback(async () => {
    // Ne pas faire l'appel si Auth0 charge encore ou si l'utilisateur n'est pas authentifié
    if (auth0Loading || !isAuthenticated || !user) {
      setAppUserData(null)
      setLoading(false)
      setError(null)
      return
    }

    try {
      setLoading(true); // Commence le chargement
      setError(null); // Réinitialise l'erreur

      const token = await getAccessTokenSilently()

      const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/user/`

      // Utilise axios pour la cohérence et la gestion des erreurs
      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'application/json', // Pas nécessaire pour un GET
        },
      });

      // Stocke les données du profil Gamer
      setAppUserData(response.data);

    } catch (err) { // Utilise 'err' pour éviter conflit avec l'état 'error'
      console.error('Erreur lors de la récupération des données utilisateur:', err)
      setError(err); // Stocke l'erreur
      setAppUserData(null) // Réinitialise les données en cas d'erreur
    } finally {
      setLoading(false) // Termine le chargement
    }
  }, [auth0Loading, isAuthenticated, user, getAccessTokenSilently]); // Dépendances

  // Récupérer les données utilisateur de l'application (backend)
  useEffect(() => {
    // Déclenche l'appel lorsque l'état d'authentification change ou l'utilisateur Auth0 change
    // et quand Auth0 a fini de charger
    if (!auth0Loading && isAuthenticated && user) {
       fetchAppUserData();
    }
    // Si l'utilisateur se déconnecte, réinitialise les données
    if (!isAuthenticated) {
        setAppUserData(null);
        setLoading(false); // Assure que le loading est false si non authentifié
        setError(null);
    }

  }, [auth0Loading, isAuthenticated, user, fetchAppUserData]); // Dépendances

  // Fonction de connexion personnalisée (peut rester)
  const login = () => { /* ... */ };

  // Fonction de déconnexion personnalisée (peut rester)
  const handleLogout = () => { /* ... */ }

  // Vérifier si l'utilisateur a un rôle spécifique (peut rester, utilise l'objet user d'Auth0)
  const hasRole = (role) => { /* ... */ }

  // Vérifier si l'utilisateur a une permission spécifique (peut rester, utilise l'objet user d'Auth0)
  const hasPermission = (permission) => { /* ... */ }

  // Obtenir le token d'accès (peut rester)
  const getToken = async () => { /* ... */ }

  // Données utilisateur enrichies (combine Auth0 et backend)
  const enrichedUser = user ? {
    ...user, // Données de base d'Auth0
    ...appUserData, // Données du profil Gamer de ton backend (pseudo, level, topGames, etc.)
    // Tu peux écraser certaines propriétés d'Auth0 si les données du backend sont prioritaires
    // Par exemple, si ton backend gère l'avatar:
    // avatar: appUserData?.avatar || user.picture,
    // displayName: appUserData?.pseudo || user.name || user.nickname || user.email,

    // Ajoute les propriétés calculées basées sur les données combinées
    displayName: appUserData?.pseudo || user.name || user.nickname || user.email, // Utilise pseudo du backend si dispo
    avatar: appUserData?.avatar || user.picture, // Utilise avatar du backend si dispo
    isAdmin: hasRole('admin'), // Basé sur les rôles Auth0
    isModerator: hasRole('moderator'), // Basé sur les rôles Auth0
    // Ajoute d'autres propriétés du backend ici (level, points, etc.)
    level: appUserData?.level,
    points: appUserData?.points,
    topGames: appUserData?.topGames,
    favoriteGame: appUserData?.favoriteGame,

  } : null

  const value = {
    // États Auth0
    user: enrichedUser, // Expose l'utilisateur enrichi
    isAuthenticated,
    isLoading: auth0Loading || loading, // Combine le chargement d'Auth0 et de l'appel API
    isInitialized, // Cet état pourrait être redondant

    // Métadonnées (maintenant les données du profil Gamer)
    appUserData, // Expose les données brutes du backend si nécessaire

    // Actions
    login,
    logout: handleLogout,
    getToken,

    // Vérifications
    hasRole,
    hasPermission,

    // Expose l'erreur de l'appel API backend
    error: error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext