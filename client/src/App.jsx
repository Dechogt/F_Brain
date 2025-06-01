import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { useAuth0 } from '@auth0/auth0-react'

// Components
import { LoadingSpinner } from './LoadingSpinner'
import { Sidebar } from './components/Layout/Sidebar'
import { Navbar } from './components/Layout/Navbar'

// Pages
import  { HomePage }  from './pages/HomePage.jsx'
import { LoginPage } from './pages/LoginPage'
import { RankingPage } from './pages/RankingPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProtectedRoute } from './ProtectedRoute'

// Hooks
import { useAuthUser } from './hooks/useAuthUser.js'

function App() {
  const { isLoading } = useAuth0()
  const { isInitialized } = useAuthUser()

  // Affichage du loading pendant l'initialisation
  if (isLoading || !isInitialized) {
    return <LoadingSpinner />
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Contenu principal */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Navbar */}
          <Navbar />
          
          {/* Contenu des pages */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              backgroundColor: 'background.default',
              minHeight: 'calc(100vh - 64px)', // 64px = hauteur Navbar
            }}
          >
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
              
              {/* Route 404 */}
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
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default App;