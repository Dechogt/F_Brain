import { useContext } from 'react'
import ThemeContext from '../contexts/ThemeContext'

export const useCustomTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useCustomTheme must be used within a ThemeContextProvider')
  }
  return context
}