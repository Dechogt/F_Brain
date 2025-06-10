// Dans services/api.js (ou là où tu utilises apiClient)
import axios from 'axios';
// Assure-toi d'avoir accès au hook useAuth0 ou à la fonction getAccessTokenSilently ici
// Cela peut nécessiter de passer getAccessTokenSilently à cette instance ou d'utiliser un contexte

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// AJOUTE CET INTERCEPTEUR
api.interceptors.request.use(
  async (config) => {
    // Assure-toi que l'utilisateur est authentifié avant d'essayer d'obtenir un token
    // Tu auras besoin d'accéder à l'état d'authentification (isAuthenticated) ici
    // Si tu utilises un contexte Auth0, tu peux l'importer ou le passer.
    // Pour simplifier l'exemple, supposons que getAccessTokenSilently est accessible.
    // Dans un vrai projet, tu intégrerais cela dans ton AuthContext ou un hook personnalisé.

    try {
      // Remplacez ceci par la manière correcte d'obtenir le token dans votre structure
      // Par exemple, si vous avez un hook useAuth qui retourne getAccessTokenSilently
      // const { getAccessTokenSilently } = useAuth();
      // const token = await getAccessTokenSilently();

      // Si getAccessTokenSilently est disponible globalement ou via un contexte accessible ici:
      const token = await getAccessTokenSilently(); // <-- Assurez-vous que cette fonction est disponible

      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      // Gérer les erreurs d'obtention de token (par exemple, l'utilisateur n'est pas connecté)
      console.error("Erreur lors de l'ajout du token d'accès:", error)
      // Tu peux choisir de rejeter la promesse ici si le token est obligatoire
      // return Promise.reject(error);
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
);

export const fetchGamers = () => api.get('gamers/')
export const fetchLeaderboard = () => api.get('leaderboard/')
export const fetchProfile = () => api.get('user/') // <-- Utilise 'user/' comme dans les logs
export const fetchGames = () => api.get('games/')

export const apiClient = api