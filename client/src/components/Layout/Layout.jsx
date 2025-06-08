import { Box, useMediaQuery, useTheme, styled, LinearProgress } from '@mui/material'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState, useEffect, useRef } from 'react' // Importe useRef
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoadingSpinner from '../Common/LoadingSpinner'
import useAuthUser from '../../hooks/useAuthUser' // Importe le hook

// Définis les largeurs de la Sidebar ici pour les utiliser dans le Layout
const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 70
const DETECTION_ZONE_WIDTH = 20; // Largeur en pixels de la zone de détection sur le bord gauche


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

const MainContent = styled(motion.main)(({ theme }) => ({
  flexGrow: 1, 
  padding: theme.spacing(3),
  
  paddingTop: theme.mixins.toolbar.minHeight, 
  width: '100%',
  maxWidth: 1800, 
  margin: '0 auto', 

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
  const [mobileOpen, setMobileOpen] = useState(false) // État pour le Drawer mobile/coulissant
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

  // --- Ref pour la zone de détection de la souris ---
  const detectionZoneRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false)
    }
  }, [location, isMobile, mobileOpen])

  // --- Effet pour gérer l'ouverture/fermeture du Drawer au passage de la souris ---
  useEffect(() => {
    
    if (isMobile) return;

    const handleMouseEnter = () => {
      
      if (!mobileOpen && collapsed) {
         setMobileOpen(true);
      }
    };

    const handleMouseLeave = () => {

      if (mobileOpen) {
         
         setTimeout(() => {
             
             setMobileOpen(false);
         }, 2000); // Délai en ms
      }
    };

    // Attache les écouteurs d'événements à la zone de détection
    const detectionZone = detectionZoneRef.current;
    if (detectionZone) {
      detectionZone.addEventListener('mouseenter', handleMouseEnter);
      detectionZone.addEventListener('mouseleave', handleMouseLeave);
    }

    // Nettoyage des écouteurs d'événements
    return () => {
      if (detectionZone) {
        detectionZone.removeEventListener('mouseenter', handleMouseEnter);
        detectionZone.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isMobile, mobileOpen, collapsed]); // Dépendances de l'effet

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
      {/* --- Zone de détection de la souris --- */}
      {!isMobile && ( // Affiche la zone seulement sur desktop
        <Box
          ref={detectionZoneRef} // Attache la ref
          sx={{
            position: 'fixed', // Fixée sur le bord gauche
            top: 0,
            left: 0,
            height: '100vh',
            width: DETECTION_ZONE_WIDTH, // Largeur de la zone de détection
            zIndex: theme.zIndex.drawer + 2, // Au-dessus de la Sidebar permanente mais sous le Drawer temporaire
            // Optionnel: background: 'rgba(255,0,0,0.1)', // Pour visualiser la zone en dev
            cursor: 'pointer', // Indique que c'est interactif
          }}
        />
      )}
      
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} // Passe l'état du mobile drawer
        setMobileOpen={setMobileOpen} // Passe la fonction pour changer l'état du mobile drawer
        // Passe la prop pour indiquer si c'est le mode coulissant activé par la souris
        isSliding={mobileOpen && !isMobile}
      />

      {/* --- Nouveau conteneur pour Navbar et MainContent --- */}
      <ContentWrapper drawerWidth={currentDrawerWidth}>
        {/* Navbar */}
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