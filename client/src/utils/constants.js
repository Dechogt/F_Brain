export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  GAMER: 'gamer',
};

export const PERMISSIONS = {
  EDIT_GAME: 'edit:game',
  VIEW_LEADERBOARD: 'read:leaderboard',
  MANAGE_USERS: 'manage:users',
};

export const SKILL_LEVELS = [
  { value: 1, label: 'Débutant' },
  { value: 2, label: 'Intermédiaire' },
  { value: 3, label: 'Avancé' },
  { value: 4, label: 'Expert' },
  { value: 5, label: 'Pro' },
];

// export const API_ENDPOINTS = {
//   GAMERS: '/api/v1/gamers/',
//   LEADERBOARD: '/api/v1/leaderboard/',
//   PROFILE: '/api/v1/profile/',
//   GAMES: '/api/v1/games/',
// };

export const API_ENDPOINTS = {
  GAMERS: '/gamers/',
  LEADERBOARD: '/leaderboard/',
  PROFILE: '/profile/',
  GAMES: '/games/'
}

export const GAME_EMOJIS = {
  'Valorant': '🔫',
  'Fortnite': '🏰',
  'CS:GO': '💣',
  'League of Legends': '⚔️'
}