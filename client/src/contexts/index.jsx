// Ré-export des contextes (version simplifiée)
export { ThemeContext, ThemeProvider, useTheme } from './ThemeContext'
export { GameContext, GameProvider, useGame } from './GameContext'
export { AuthContext, AuthProvider, useAuth } from './AuthContext'

// Provider combiné
export const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <GameProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </GameProvider>
    </AuthProvider>
  )
}