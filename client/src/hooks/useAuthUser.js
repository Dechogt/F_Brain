import { useEffect, useState, useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const useAuthUser = () => {
  const {
    user,
    isAuthenticated,
    getAccessTokenSilently,
    isLoading: auth0Loading,
    error: auth0Error,
  } = useAuth0()

  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const NAMESPACE = import.meta.env.VITE_AUTH0_NAMESPACE

  const fetchUserData = useCallback(async () => {
    if (auth0Error) {
      setError(auth0Error)
      setLoading(false)
      setUserData(null)
      return
    }

    if (auth0Loading || !isAuthenticated || !user?.sub) {
      if (!isAuthenticated) {
         setLoading(false)
         setUserData(null)
         setError(null)
      }
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let token;
      try {
        const tokenOptions = { /* ... */ }
        const audience = import.meta?.env?.VITE_AUTH0_AUDIENCE
        if (audience) { tokenOptions.audience = audience }

        console.log('Tentative d\'obtention du token avec options:', tokenOptions)
        token = await getAccessTokenSilently(tokenOptions)

        if (!token) {
          throw new Error('Token vide reçu de Auth0')
        }
        console.log('Token obtenu avec succès')

      } catch (tokenError) {
        console.error('Erreur lors de l\'obtention du token:', tokenError)
        // Gérer les erreurs spécifiques d'Auth0 si nécessaire
        setError(new Error('Impossible d\'obtenir le token d\'accès Auth0'))
        setLoading(false) // Termine le chargement ici si le token n'est pas obtenu
        setUserData(null)
        return // Arrête l'exécution si le token n'est pas obtenu
      }

      try {
        console.log('Appel API /api/user/ avec token')
        const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/user/`

        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000
        });

        console.log('Données utilisateur reçues:', response.data);
        setUserData(response.data);

      } catch (apiError) {
        console.error('Erreur lors de l\'appel API backend:', apiError);

        // Gérer les erreurs spécifiques de l'API backend (ex: 401, 404, 500)
        if (apiError.response?.status === 401) {
           console.warn('API backend renvoie 401 Unauthorized');
           setError(new Error('Accès API non autorisé.'));
        } else if (apiError.response?.status === 404) {
           console.warn('API backend renvoie 404 Not Found');
           setError(new Error('Endpoint API utilisateur non trouvé.'));
        } else if (apiError.response?.status === 500) {
           console.warn('API backend renvoie 500 Internal Server Error');
           setError(new Error('Erreur serveur lors de la récupération des données utilisateur.'));
        } else if (apiError.code === 'ECONNABORTED') {
           setError(new Error('Délai d\'attente de l\'API dépassé.'));
        } else {
           setError(apiError);
        }

        setUserData(null) 
        
      }

    } catch (err) { 
      
      console.error('Erreur inattendue dans fetchUserData:', err);
      setError(err) 
      setUserData(null) 
    } finally { 
      setLoading(false) 
    }

  }, [
    auth0Loading,
    isAuthenticated,
    user,
    auth0Error,
    getAccessTokenSilently,
  ]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData])

  return {
    user: userData ? { ...user, ...userData } : user,
    isAuthenticated,
    isLoading: auth0Loading || loading,
    error,
  }
}

export default useAuthUser