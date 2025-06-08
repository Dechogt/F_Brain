import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import axios from 'axios'

const useAuthUser = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0()
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      // Si l'utilisateur n'est pas authentifié, on termine le chargement
      // et on réinitialise les données et l'erreur
      if (!isAuthenticated) {
        setLoading(false);
        setUserData(null);
        setError(null);
        return;
      }

      try {
        setLoading(true); 
        setError(null); 

        const token = await getAccessTokenSilently();

        const { data } = await axios.get('/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Met à jour les données utilisateur si la requête réussit
        setUserData(data);

      } catch (err) {
        // En cas d'erreur lors de l'appel API
        console.error('Error fetching user data:', err);
        setError(err); 
        setUserData(null); 
      } finally {
        
        setLoading(false)
      }
    };

    
    fetchUserData();
  }, [isAuthenticated, user?.sub]); 


  return {
    user: { ...user, ...userData }, 
    isAuthenticated,
    loading, 
    error, 
  };
};

export default useAuthUser