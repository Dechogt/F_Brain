import { Box, useMediaQuery, useTheme, styled, LinearProgress } from '@mui/material'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoadingSpinner from '../Common/LoadingSpinner'

// Définis les largeurs de la Sidebar ici pour les utiliser dans le Layout
const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 70

// Style personnalisé pour le contenu principal
const MainContent = styled(motion.main)(({ theme, drawerWidth }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  paddingTop: theme.mixins.toolbar.minHeight,
  width: '100%', // Par défaut, prend 100% de la largeur disponible
  // Retire le maxWidth et margin: '0 auto' des styles de base

  [theme.breakpoints.up('md')]: {
     marginLeft: `${drawerWidth}px`, 
     width: `calc(100% - ${drawerWidth}px)`, 
     // Applique le maxWidth et le centrage APRES avoir pris en compte la Sidebar
     maxWidth: 1800, 
     margin: '0 auto', 
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    paddingTop: theme.mixins.toolbar.minHeight,
    marginLeft: 0, 
    width: '100%', 
    maxWidth: '100%', 
    margin: '0 auto', 
  }
}))

// Composant de transition entre les pages
const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.5, ease: 'easeInOut' }}
  >
    {children}
  </motion.div>
)

const Layout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [collapsed, setCollapsed] = useState(false)

  // --- Déclare l'état mobileOpen ici ---
  const [mobileOpen, setMobileOpen] = useState(false)
  // ------------------------------------

  // --- Supprime ou commente les états inutilisés si tu ne les utilises pas ---
  // const [sidebarOpen, setSidebarOpen] = useState(false) // Probablement inutile si tu utilises mobileOpen
  const [isScrolled, setIsScrolled] = useState(false)
  // const [loading, setLoading] = useState(true) // Inutilisé après désactivation du faux chargement
  // const [progress, setProgress] = useState(0) // Inutilisé après désactivation du faux chargement
  // -------------------------------------------------------------------------

  const location = useLocation()
  const { isLoading: auth0Loading } = useAuth0()

  const currentDrawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  // Effet de chargement initial (basé sur Auth0)
  useEffect(() => {
    // Si tu veux lier le chargement à Auth0 et useAuthUser:
    // const { loading: userLoading } = useAuthUser(); // Importe useAuthUser
    // if (!auth0Loading && !userLoading) {
    //   setLoading(false); // Utilise l'état loading si tu le gardes
    // } else {
    //   setLoading(true); // Utilise l'état loading si tu le gardes
    // }
    // Pour l'instant, on se base juste sur auth0Loading pour l'affichage du spinner pleine page
  }, [auth0Loading]); // Ajoute les dépendances de chargement réelles

  // Gestion du scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermeture automatique du sidebar sur mobile
  useEffect(() => {
    // Utilise mobileOpen et setMobileOpen
    if (isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [location, isMobile, mobileOpen]) // Dépendances correctes

  // Fond animé gaming (peut rester tel quel)
  const getBackground = () => {
    return `
      radial-gradient(circle at 10% 20%,
        ${theme.palette.primary.dark}15 0%,
        transparent 25%),
      radial-gradient(circle at 90% 80%,
        ${theme.palette.secondary.dark}15 0%,
        transparent 25%),
      linear-gradient(
        135deg,
        ${theme.palette.background.default} 0%,
        ${theme.palette.background.paper} 100%
      ),
      url('data:image/svg+xml;utf8,<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="none" />
        <path d="M0 0 L100 100 M0 100 L100 0" stroke="${theme.palette.background.paper.replace('#', '%23')}" stroke-width="0.5" opacity="0.2" />
      </svg>')
    `
  }

  // Affiche le spinner pleine page si Auth0 charge
   if (auth0Loading) {
     return <LoadingSpinner isOverlay={true} />;
   }

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: getBackground(),
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflowX: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(45deg, ${theme.palette.primary.dark}01 0%, ${theme.palette.secondary.dark}01 100%)`,
          pointerEvents: 'none'
        }
      }}
    >
      {/* Barre de progression (si tu la gardes et la lies à un chargement réel) */}
      {/* {loading && progress < 100 && ( ... )} */}


      {/* Navbar */}
      <Navbar
        isScrolled={isScrolled}
        onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} // Passe la fonction pour ouvrir/fermer le mobile drawer
        drawerWidth={currentDrawerWidth} // Passe la largeur actuelle de la Sidebar
      />

      {/* Sidebar (Desktop permanent et Mobile temporary) */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} // Passe l'état du mobile drawer
        setMobileOpen={setMobileOpen} // Passe la fonction pour changer l'état du mobile drawer
      />

      {/* Contenu principal */}
      <MainContent
        key={location.pathname}
        initial="hidden"
        animate="visible"
        drawerWidth={currentDrawerWidth} // Passe la largeur actuelle de la Sidebar au MainContent
      >
        <AnimatePresence mode="wait">
          <PageTransition>
            {children}
          </PageTransition>
        </AnimatePresence>
      </MainContent>

      {/* Effets visuels gaming */}
      {[...Array(5)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 20 + i * 5,
            repeat: Infinity,
            ease: 'linear'
          }}
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i % 2 === 0 ? theme.palette.primary.light : theme.palette.secondary.light}10 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}
    </Box>
  )
}

export default Layout