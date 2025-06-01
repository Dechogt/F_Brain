import axios from 'axios';

const API_BASE_URLH = '/api/v1/';

const api = axios.create({
  baseURL: API_BASE_URLH,
  withCredentials: true, // pour les cookies CSRF si nécessaire
});

// Ajoute un token si besoin à l'avenir
// api.interceptors.request.use(config => { ... });

export const fetchGamers = () => api.get('gamers/');
export const fetchLeaderboard = () => api.get('leaderboard/');
export const fetchProfile = () => api.get('profile/');
export const fetchGames = () => api.get('games/');

export const apiClient = api;
