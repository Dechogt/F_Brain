import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const useAuthUser = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mémoïser getAccessTokenSilently pour éviter les recréations inutiles
  const memoizedGetToken = useCallback(async () => {
    return await getAccessTokenSilently();
  }, [getAccessTokenSilently]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        setUserData(null);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const token = await memoizedGetToken();

        const { data } = await axios.get('/api/user/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserData(data);

      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isAuthenticated, user?.sub, memoizedGetToken]); // Ajout de memoizedGetToken aux dépendances

  return {
    user: { ...user, ...userData },
    isAuthenticated,
    loading,
    error,
  };
};

export default useAuthUser;