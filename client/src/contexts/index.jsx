import React from 'react';

import { AuthProvider, AuthContext } from './AuthContext.jsx'

import { GameContextProvider } from './GameContext'
import { ThemeContextProvider } from './ThemeContext'

// Export des contexts seulement
export { default as ThemeContext } from './ThemeContext'
export { default as GameContext } from './GameContext'
// --- Exporte AuthContext comme export nommé ---
export { AuthContext } from './AuthContext'
// ---------------------------------------------

// Export des providers seulement
export { ThemeContextProvider as ThemeProvider } from './ThemeContext'
export { GameContextProvider as GameProvider } from './GameContext'
// Retire cet export si tu utilises l'import nommé AuthProvider ci-dessus
// export { AuthContextProvider as AuthProvider } from './AuthContext'


// Provider combiné
export const AppProviders = ({ children }) => {
  return (
    // --- Utilise le composant fournisseur AuthProvider ---
    <AuthProvider>
      <GameContextProvider>
        <ThemeContextProvider>
          {children}
        </ThemeContextProvider>
      </GameContextProvider>
    </AuthProvider>
  )
}

// Si tu veux exporter le hook useAuth directement depuis index.jsx
// import { useAuth } from './AuthContext.jsx';
// export { useAuth };