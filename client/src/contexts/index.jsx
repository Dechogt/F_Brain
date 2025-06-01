import React from 'react';
import { AuthContextProvider } from './AuthContext';
import { GameContextProvider } from './GameContext';
import { ThemeContextProvider } from './ThemeContext';

// Export des contexts seulement
export { default as ThemeContext } from './ThemeContext';
export { default as GameContext } from './GameContext';
export { default as AuthContext } from './AuthContext';

// Export des providers seulement
export { ThemeContextProvider as ThemeProvider } from './ThemeContext';
export { GameContextProvider as GameProvider } from './GameContext';
export { AuthContextProvider as AuthProvider } from './AuthContext';

// Provider combiné
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