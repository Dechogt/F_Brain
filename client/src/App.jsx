import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material' // Retire Container ici
// Retire useAuth0 si tu ne l'utilises pas directement ici
// import { useAuth0 } from '@auth0/auth0-react'

import { LoadingSpinner } from './components/Common/LoadingSpinner'
import { Sidebar } from './components/Layout/Sidebar'
import { Navbar } from './components/Layout/Navbar'

// Pages
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage'
import RankingPage from './pages/RankingPage'
import ProfilePage from './pages/ProfilePage'
import ProtectedRoute from './components/Common/ProtectedRoute'

// --- Utilise le hook useAuth qui consomme AuthContext ---
import { useAuth } from './hooks/useAuth'

// Retire useAuthUser si tu l'as supprimé
// import useAuthUser from './hooks/useAuthUser.js'
// -------------------------------------------------------

// Importe les composants stylisés du Layout
import { ContentWrapper, MainContent } from './components/Layout/Layout' // Assure-toi que ces composants sont exportés depuis Layout.jsx

// Définis les largeurs de la Sidebar ici aussi si tu ne les passes pas toutes en props
// Ou importe-les depuis Layout.jsx si elles y sont définies
const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;


function App() {
  
  const { isLoading, error } = useAuth()
  
  // const { isLoading: auth0Loading, error: auth0Error } = useAuth0()
  // const { loading: userLoading, error: userError } = useAuth()

  // console.log('App Loading State:')
  // console.log('  Auth0 isLoading:', auth0Loading)
  // console.log('  useAuthUser loading:', userLoading)
  // console.log('  Auth0 Error:', auth0Error)
  // console.log('  useAuthUser Error:', userError)

  const [collapsed, setCollapsed] = useState(false) 
  const currentDrawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH

   if (isLoading) {
     return <LoadingSpinner isOverlay={true} />
   }

  // Affiche l'erreur si error du hook useAuth est présent
   if (error) {
       console.error("Rendering App Error:", error)
       return <div>Erreur de l'application: {error.message || 'Une erreur inconnue est survenue.'}</div>
   }

  // Si tout a fini de charger et qu'il n'y a pas d'erreur
  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* Sidebar */}
        {/* Passe les props nécessaires à Sidebar */}
        <Sidebar
           drawerWidth={DRAWER_WIDTH}
           drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
           collapsed={collapsed}
           setCollapsed={setCollapsed}
           // mobileOpen et setMobileOpen sont gérés dans Layout.jsx et passés à Sidebar
           // mobileOpen={mobileOpen}
           // setMobileOpen={setMobileOpen}
           // isSliding={mobileOpen && !isMobile} 
        />

        {/* Conteneur principal (Navbar + Contenu des pages) */}
        {/* Utilise le ContentWrapper du Layout */}
        <ContentWrapper drawerWidth={currentDrawerWidth}>
          
          <Navbar
             // isScrolled={isScrolled} // Si isScrolled est géré dans Layout
             // onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} // Si mobileOpen est géré dans App
             drawerWidth={currentDrawerWidth}
          />

          <MainContent
            // key={location.pathname} // Si key est géré dans Layout
            // initial="hidden" // Si animation est gérée dans Layout
            // animate="visible" // Si animation est gérée dans Layout
          >
            {/* Retire le Container d'ici */}
            {/* <Container maxWidth="lg"> */}
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
            {/* </Container> */}
          </MainContent>
        </ContentWrapper>
      </Box>
    </Router>
  )
}

export default App