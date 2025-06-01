import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const GameContext = createContext();

export const GameContextProvider = ({ children }) => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  
  // États pour les données gaming
  const [gamers, setGamers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Genres de jeux disponibles
  const gameGenres = [
    { id: 'fps', name: 'FPS', icon: '🎯', color: '#FF4444' },
    { id: 'moba', name: 'MOBA', icon: '⚔️', color: '#4CAF50' },
    { id: 'rpg', name: 'RPG', icon: '🗡️', color: '#9C27B0' },
    { id: 'strategy', name: 'Stratégie', icon: '🏰', color: '#FF9800' },
    { id: 'racing', name: 'Course', icon: '🏎️', color: '#2196F3' },
    { id: 'sports', name: 'Sports', icon: '⚽', color: '#4CAF50' },
    { id: 'battle-royale', name: 'Battle Royale', icon: '💥', color: '#F44336' },
    { id: 'mmo', name: 'MMO', icon: '🌍', color: '#673AB7' },
  ];

  // Récupérer le profil utilisateur avec useCallback
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
      }
    } catch (err) {
      setError('Erreur lors du chargement du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Récupérer la liste des gamers pour le classement avec useCallback
  const fetchGamers = useCallback(async () => {
    try {
      setLoading(true);
      const token = isAuthenticated ? await getAccessTokenSilently() : null;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/gamers/`, {
        headers,
      });

      if (response.ok) {
        const gamersData = await response.json();
        setGamers(gamersData);
      }
    } catch (err) {
      setError('Erreur lors du chargement des gamers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  // Mettre à jour le profil utilisateur
  const updateUserProfile = async (profileData) => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/profile/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        return updatedProfile;
      }
    } catch (err) {
      setError('Erreur lors de la mise à jour du profil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculer le niveau d'un gamer basé sur ses stats
  const calculateLevel = (stats) => {
    if (!stats) return 1;
    const totalXp = stats.wins * 100 + stats.kills * 10 + stats.assists * 5;
    return Math.floor(totalXp / 1000) + 1;
  };

  // Calculer le rang d'un gamer
  const calculateRank = (stats) => {
    if (!stats) return 'Bronze';
    const level = calculateLevel(stats);
    
    if (level >= 50) return 'Challenger';
    if (level >= 40) return 'Master';
    if (level >= 30) return 'Diamond';
    if (level >= 20) return 'Platinum';
    if (level >= 10) return 'Gold';
    if (level >= 5) return 'Silver';
    return 'Bronze';
  };

  // Charger les données au montage
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    }
    fetchGamers();
  }, [isAuthenticated, fetchUserProfile, fetchGamers]);

  const value = {
    // États
    gamers,
    userProfile,
    loading,
    error,
    gameGenres,
    
    // Actions
    fetchGamers,
    fetchUserProfile,
    updateUserProfile,
    calculateLevel,
    calculateRank,
    
    // Utilitaires
    setError,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;