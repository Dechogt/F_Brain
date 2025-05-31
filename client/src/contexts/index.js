// Export des contextes
export { default as ThemeContext, ThemeContextProvider, useTheme } from './ThemeContext';
export { default as GameContext, GameContextProvider, useGame } from './GameContext';
export { default as AuthContext, AuthContextProvider, useAuth } from './AuthContext';

// Provider combiné pour englober toute l'app
import React from 'react';
import { ThemeContextProvider } from './ThemeContext';
import { GameContextProvider } from './GameContext';
import { AuthContextProvider } from './AuthContext';

export const AppProviders = ({ children }) => {
  return (
    <AuthContextProvider>
      <GameContextProvider>
        <ThemeContextProvider>
          {children}
        </ThemeContextProvider>
      </GameContextProvider>
    </AuthContextProvider>
  );
};