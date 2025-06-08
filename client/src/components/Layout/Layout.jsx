import { Box, useMediaQuery, useTheme, styled, LinearProgress } from '@mui/material'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoadingSpinner from '../Common/LoadingSpinner'
import useAuthUser from '../../hooks/useAuthUser' // Importe le hook

// Définis les largeurs de la Sidebar ici pour les utiliser dans le Layout
const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 70

// Style personnalisé pour le conteneur principal (qui contient Navbar et MainContent)
// Ce conteneur prendra tout l'espace à droite de la Sidebar
const ContentWrapper = styled(Box)(({ theme, drawerWidth }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  // Sur desktop, décale le wrapper de la largeur de la Sidebar
  [theme.breakpoints.up('md')]: {
    marginLeft: `${drawerWidth}px`,
    width: `calc(100% - ${drawerWidth}px)`, // Optionnel, flexGrow suffit souvent
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));


// Style personnalisé pour le contenu principal (qui contient les pages)
const MainContent = styled(motion.main)(({ theme }) => ({
  flexGrow: 1, // Permet au contenu principal de prendre l'espace restant sous la Navbar
  padding: theme.spacing(3),
  // Ajoute un padding top pour laisser de la place à la Navbar
  // Utilise la hauteur de la Toolbar de Material UI (par défaut 64px sur desktop)
  paddingTop: theme.mixins.toolbar.minHeight, // Utilise la hauteur de la toolbar du thème
  width: '100%', // Assure qu'il prend 100% de la largeur de son parent (ContentWrapper)
  // Retire les styles de centrage et maxWidth d'ici
  // maxWidth: 1800,
  // margin: '0 auto',

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    paddingTop: theme.mixins.toolbar.minHeight,
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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const location = useLocation()
  const { isLoading: auth0Loading } = useAuth0()
  // --- Appelle useAuthUser au niveau supérieur du composant ---
  const { loading: userLoading } = useAuthUser();
  // ----------------------------------------------------------

  // Détermine la largeur actuelle de la Sidebar
  const currentDrawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  // Logique de chargement combinée
  // Affiche le spinner si Auth0 charge OU si useAuthUser charge
  const showLoadingSpinner = auth0Loading || userLoading;


  // Gestion du scroll (peut rester)
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fermeture automatique du sidebar sur mobile (peut rester)
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [location, isMobile, mobileOpen])

  // Fond animé gaming (peut rester)
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

  // Affiche le spinner pleine page si showLoadingSpinner est vrai
   if (showLoadingSpinner) {
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
      
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <ContentWrapper drawerWidth={currentDrawerWidth}>
        
        <Navbar
          isScrolled={isScrolled}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          drawerWidth={currentDrawerWidth}
        />

        {/* Contenu principal (les pages) */}
        <MainContent
          key={location.pathname}
          initial="hidden"
          animate="visible"
          // drawerWidth={currentDrawerWidth} // Plus nécessaire ici, géré par ContentWrapper
        >
        
          <AnimatePresence mode="wait">
            <PageTransition>
              {children}
            </PageTransition>
          </AnimatePresence>
        </MainContent>
      </ContentWrapper>

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