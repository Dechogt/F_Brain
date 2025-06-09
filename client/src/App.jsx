import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import {Container, Box } from '@mui/material'
import { useAuth0 } from '@auth0/auth0-react'
import { LoadingSpinner } from './components/Common/LoadingSpinner'
import { Sidebar } from './components/Layout/Sidebar'
import { Navbar } from './components/Layout/Navbar'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage'
import RankingPage from './pages/RankingPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/Common/ProtectedRoute' 

// Hooks
import useAuthUser from './hooks/useAuthUser.js'

function App() {
  
  const { isLoading: auth0Loading, error: auth0Error } = useAuth0()
 
  const { loading: userLoading, error: userError } = useAuthUser() 

  // --- Console logs pour le débogage ---
  console.log('App Loading State:')
  console.log('  Auth0 isLoading:', auth0Loading)
  console.log('  useAuthUser loading:', userLoading)
  console.log('  Auth0 Error:', auth0Error)
  console.log('  useAuthUser Error:', userError)
  // -------------------------------------

  // Affichage du loading pendant l'initialisation
  // Affiche le spinner si Auth0 charge OU si useAuthUser charge
  if (auth0Loading || userLoading) {
    return <LoadingSpinner />
  }

  // Si une erreur se produit (Auth0 ou useAuthUser)
  if (auth0Error) {
      console.error("Rendering Auth0 Error:", auth0Error); // Log l'erreur avant de l'afficher
      return <div>Erreur d'authentification: {auth0Error.message}</div>
  }
  if (userError) {
      console.error("Rendering User Data Error:", userError); // Log l'erreur avant de l'afficher
      // Affiche un message d'erreur plus convivial pour l'utilisateur
      return <div>Erreur lors du chargement des données utilisateur: {userError.message || 'Une erreur inconnue est survenue.'}</div>
  }

  // Si tout a fini de charger et qu'il n'y a pas d'erreur
  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar - Peut être conditionnel si l'utilisateur n'est pas connecté */}
        {/* {isAuthenticated && <Sidebar />} */}
        <Sidebar />

        {/* Contenu principal */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Navbar - Peut être conditionnel */}
          {/* {isAuthenticated && <Navbar />} */}
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
            <Container maxWidth="lg">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<HomePage />} />
                {/* La page de login ne devrait être accessible que si non authentifié */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/ranking" element={<RankingPage />} />

                {/* Routes protégées - Nécessitent une authentification */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute> {/* ProtectedRoute utilise useAuth0().isAuthenticated */}
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
            </Container>
          </Box>
        </Box>
      </Box>
    </Router>
  )
}

export default App