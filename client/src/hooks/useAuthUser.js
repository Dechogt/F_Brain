import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const useAuthUser = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // <-- Ajout de l'état d'erreur

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
        setLoading(true); // Commence le chargement
        setError(null); // Réinitialise l'erreur avant la requête

        // Récupère le token d'accès silencieusement
        const token = await getAccessTokenSilently();

        // Fais l'appel API à ton backend Django pour récupérer les données utilisateur
        // Assure-toi que l'URL '/api/user' est correcte par rapport à ta configuration Nginx/Django
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
        setError(err); // <-- Stocke l'erreur
        setUserData(null); // Réinitialise les données en cas d'erreur
      } finally {
        // Termine le chargement, que la requête ait réussi ou échoué
        setLoading(false);
      }
    };

    // Exécute la fonction fetchUserData lorsque l'état d'authentification change
    // ou lorsque l'utilisateur change (user?.sub est l'ID unique de l'utilisateur Auth0)
    // getAccessTokenSilently est stable, pas besoin de l'ajouter aux dépendances
    fetchUserData();
  }, [isAuthenticated, user?.sub]); // Dépendances du useEffect

  // Retourne les états et données du hook
  return {
    user: { ...user, ...userData }, // Combine les infos Auth0 de base avec les données spécifiques de l'API
    isAuthenticated,
    loading, // <-- Retourne l'état de chargement
    error, // <-- Retourne l'état d'erreur
  };
};

export default useAuthUser;