import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box, useMediaQuery, useTheme as useMuiTheme } from '@mui/material' 

import { LoadingSpinner } from './components/Common/LoadingSpinner'
import { Sidebar } from './components/Layout/Sidebar'
import { Navbar } from './components/Layout/Navbar'

import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage'
import RankingPage from './pages/RankingPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/Common/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import { useCustomTheme } from './hooks/useTheme' 

// Utilise le nouveau hook AuthContext
import { AuthContext } from './contexts/AuthContext.jsx'

// Importe les composants stylisés du Layout
import { ContentWrapper, MainContent } from './components/Layout/Layout'

// Définis les largeurs de la Sidebar
const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 70

function App() {
  const {
    isLoading,
    isAuthenticated,
    error: authError, 
    loginWithRedirect,
    clearError,
    user,
  } = AuthContext

  // États liés au Layout (si gérés dans App.jsx)
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  // Sur mobile, la Sidebar est temporaire, donc le décalage est 0
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'))

  const { isDarkMode, toggleDarkMode } = useCustomTheme()
  const currentDrawerWidth = !isMobile && isAuthenticated ? (collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH) : 0
  // Ajuste la logique si la Sidebar est toujours visible mais repliée même si non authentifié
  // Gestion de l'état de chargement global
  if (isLoading) {
    return <LoadingSpinner isOverlay={true} />
  }

  // Gestion des erreurs d'authentification/API
  if (authError) {
    console.error("App Authentication Error:", authError)
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: 3,
          textAlign: 'center',
          gap: 2,
          backgroundColor: 'background.default', 
          color: 'text.primary', 
        }}
      >
        <h2>Erreur de l'application</h2> 
        <p style={{ color: theme.palette.error.main, marginBottom: '20px' }}>
          {authError.message || String(authError)} {/* Affiche le message de l'erreur */}
        </p>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined" // Utilise les styles de bouton du thème
            onClick={clearError}
          >
            Effacer l'erreur
          </Button>
          <Button
            variant="contained" // Utilise les styles de bouton du thème
            onClick={() => loginWithRedirect()}
          >
            Se reconnecter
          </Button>
        </Box>
      </Box>
    )
  }

  // Rendu principal de l'application
  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar - Toujours rendue, visibilité gérée par le composant Sidebar lui-même */}
        <Sidebar
          drawerWidth={DRAWER_WIDTH}
          drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          mobileOpen={mobileOpen} 
          setMobileOpen={setMobileOpen}
        />

        {/* Conteneur principal (Navbar + Contenu des pages) */}
        <ContentWrapper
          drawerWidth={isAuthenticated ? currentDrawerWidth : 0} // Ajuste le décalage si non authentifié
        >
          
          <Navbar
            drawerWidth={currentDrawerWidth} 
            user={user} 
            isAuthenticated={isAuthenticated} 
            isScrolled={isScrolled} 
            onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} 
          />

          <MainContent>
            {/* Le Container doit être à l'intérieur de chaque page */}
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/ranking" element={<RankingPage />} />
              {/* Routes protégées */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              
              <Route path="/dashboard" 
                element={
                <ProtectedRoute 
                requiredRole="admin"
                >
                  <Dashboard />
                </ProtectedRoute>
                } 
              />

              <Route
                path="*"
                element={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '50vh',
                      textAlign: 'center',
                    }}
                  >
                    <div>
                      <h1>404 - Page non trouvée</h1>
                      <p>La page que vous cherchez n'existe pas.</p>
                    </div>
                  </Box>
                }
              />
            </Routes>
          </MainContent>
        </ContentWrapper>
      </Box>
    </Router>
  )
}

export default App