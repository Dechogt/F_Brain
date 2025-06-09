import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const useAuthUser = () => {
  const { 
    user, 
    isAuthenticated, 
    getAccessTokenSilently, 
    isLoading: auth0Loading,
    logout,
    error: auth0Error 
  } = useAuth0()
  
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchUserData = useCallback(async () => {
    // Si Auth0 a une erreur, propager l'erreur
    if (auth0Error) {
      setError(auth0Error)
      setLoading(false)
      return
    }

    // Ne pas essayer de récupérer les données si Auth0 est encore en train de charger
    if (auth0Loading) {
      return
    }

    // Si l'utilisateur n'est pas authentifié, réinitialiser les données
    if (!isAuthenticated) {
      setLoading(false)
      setUserData(null)
      setError(null)
      return
    }

    // Si l'utilisateur est authentifié mais qu'on n'a pas encore les infos de base
    if (!user?.sub) {
      // Attendre un peu plus longtemps pour que Auth0 finisse de charger
      setTimeout(() => {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1)
        }
      }, 1000)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Obtenir le token d'accès avec gestion d'erreur améliorée
      let token
      try {
        // Configuration du token avec audience si disponible
        const tokenOptions = {
          scope: 'read:user read:profile'
        }
        
        // Ajouter l'audience si elle est définie dans les variables d'environnement
        const audience = import.meta?.env?.VITE_AUTH0_AUDIENCE
        
        if (audience) {
          tokenOptions.audience = audience
        }

        console.log('Tentative d\'obtention du token avec options:', tokenOptions)
        token = await getAccessTokenSilently(tokenOptions)
        
        if (!token) {
          throw new Error('Token vide reçu')
        }
        
        console.log('Token obtenu avec succès')
      } catch (tokenError) {
        console.error('Erreur lors de l\'obtention du token:', tokenError)
        
        // Si c'est une erreur de consentement, on redirige vers la login
        if (tokenError.error === 'consent_required' || 
            tokenError.error === 'login_required') {
          console.warn('Reconnexion requise')
          logout({ 
            logoutParams: { 
              returnTo: window.location.origin 
            } 
          })
          return
        }
        
        throw new Error('Impossible d\'obtenir le token d\'accès')
      }

      // Faire la requête vers l'API avec retry automatique
      let response
      try {
        console.log('Appel API /api/user/ avec token')
        response = await axios.get('/api/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000 // Augmenté à 15 secondes
        })
        
        console.log('Données utilisateur reçues:', response.data)
        setUserData(response.data)
        setRetryCount(0) // Reset retry count on success
        
      } catch (apiError) {
        console.error('Erreur API:', apiError)
        
        // Gestion spécifique des erreurs API
        if (apiError.response?.status === 401) {
          console.warn('Token non valide - tentative de rafraîchissement')
          
          // Essayer de forcer le rafraîchissement du token
          try {
            const freshToken = await getAccessTokenSilently({
              cacheMode: 'off', // Force un nouveau token
              ...(import.meta?.env?.VITE_AUTH0_AUDIENCE && {
                audience: import.meta.env.VITE_AUTH0_AUDIENCE
              })
            })
            
            // Retry avec le nouveau token
            const retryResponse = await axios.get('/api/user/', {
              headers: {
                Authorization: `Bearer ${freshToken}`,
                'Content-Type': 'application/json'
              },
              timeout: 15000
            })
            
            setUserData(retryResponse.data)
            setRetryCount(0)
            return
            
          } catch (refreshError) {
            console.error('Échec du rafraîchissement du token:', refreshError)
            // Force logout si le refresh échoue
            logout({ 
              logoutParams: { 
                returnTo: window.location.origin 
              } 
            })
            return
          }
        }
        
        throw apiError
      }

    } catch (err) {
      console.error('Erreur lors de la récupération des données utilisateur:', err)
      
      // Gestion spécifique des erreurs
      if (err.response?.status === 401) {
        console.warn('Session expirée définitivement')
        setError(new Error('Session expirée, veuillez vous reconnecter'))
        // Auto-logout après un délai
        setTimeout(() => {
          logout({ 
            logoutParams: { 
              returnTo: window.location.origin 
            } 
          })
        }, 3000)
      } else if (err.response?.status === 404) {
        console.warn('Endpoint utilisateur non trouvé')
        setError(new Error('Service utilisateur non disponible'))
      } else if (err.response?.status === 500) {
        console.warn('Erreur serveur')
        setError(new Error('Erreur serveur, veuillez réessayer'))
      } else if (err.code === 'ECONNABORTED') {
        setError(new Error('Délai d\'attente dépassé'))
      } else if (err.name === 'NetworkError' || err.code === 'NETWORK_ERROR') {
        setError(new Error('Erreur de connexion réseau'))
      } else {
        setError(err)
      }
      
      setUserData(null)
    } finally {
      setLoading(false)
    }
  }, [
    isAuthenticated, 
    user?.sub, 
    getAccessTokenSilently, 
    auth0Loading, 
    auth0Error,
    logout,
    retryCount
  ])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Fonction pour retry en cas d'erreur
  const retry = useCallback(() => {
    setError(null)
    setRetryCount(0)
    fetchUserData()
  }, [fetchUserData])

  // Fonction pour forcer la reconnexion
  const forceReconnect = useCallback(() => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    })
  }, [logout])

  return {
    user: userData ? { ...user, ...userData } : user,
    isAuthenticated,
    loading: auth0Loading || loading,
    error,
    retry,
    forceReconnect
  }
}

export default useAuthUser