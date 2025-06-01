import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Par défaut dark mode pour gaming
  const [accentColor, setAccentColor] = useState('#00E676'); // Vert gaming par défaut

  // Couleurs d'accent disponibles
  const accentColors = {
    green: '#00E676',
    blue: '#00B8D4',
    purple: '#7C4DFF',
    orange: '#FF6B35',
    pink: '#FF4081',
    yellow: '#FFEB3B'
  };

  // Sauvegarder les préférences dans localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('gaming-theme');
    if (savedTheme) {
      const { isDark, accent } = JSON.parse(savedTheme);
      setIsDarkMode(isDark);
      setAccentColor(accent);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('gaming-theme', JSON.stringify({
      isDark: isDarkMode,
      accent: accentColor
    }));
  }, [isDarkMode, accentColor]);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const changeAccentColor = (color) => {
    setAccentColor(accentColors[color] || color);
  };

  const value = {
    isDarkMode,
    accentColor,
    accentColors,
    toggleDarkMode,
    changeAccentColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;