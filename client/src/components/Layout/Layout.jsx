import { Box, useMediaQuery, useTheme, styled, LinearProgress } from '@mui/material'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import LoadingSpinner from '../Common/LoadingSpinner'
import useAuthUser from '../../hooks/useAuthUser' 

const DRAWER_WIDTH = 280
const DRAWER_WIDTH_COLLAPSED = 70
const DETECTION_ZONE_WIDTH = 20 

export const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'drawerWidth' // en passant comme ceci react n'essaiee pas le DOM
})(({ theme, drawerWidth }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  // Sur desktop, décale le wrapper de la largeur de la Sidebar
  [theme.breakpoints.up('md')]: {
    marginLeft: `${drawerWidth}px`,
    width: `calc(100% - ${drawerWidth}px)`,
  },
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

export const MainContent = styled(motion.main)(({ theme }) => ({
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
  
  const { loading: userLoading } = useAuthUser()

  const currentDrawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH
  const showLoadingSpinner = auth0Loading || userLoading
  const detectionZoneRef = useRef(null)

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

  useEffect(() => {
    
    if (isMobile) return

    const handleMouseEnter = () => {
      
      if (!mobileOpen && collapsed) {
        setMobileOpen(true)
      }
    }

    const handleMouseLeave = () => {

      if (mobileOpen) {
        setTimeout(() => {
            setMobileOpen(false)
         }, 300); // Délai en ms
      }
    };

    const detectionZone = detectionZoneRef.current;
    if (detectionZone) {
      detectionZone.addEventListener('mouseenter', handleMouseEnter)
      detectionZone.addEventListener('mouseleave', handleMouseLeave)
    }

    // Nettoyage des écouteurs d'événements
    return () => {
      if (detectionZone) {
        detectionZone.removeEventListener('mouseenter', handleMouseEnter)
        detectionZone.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isMobile, mobileOpen, collapsed])

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

  if (showLoadingSpinner) {
    return <LoadingSpinner isOverlay={true} />
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
     
      {!isMobile && ( 
        <Box
          ref={detectionZoneRef}
          sx={{
            position: 'fixed', 
            top: 0,
            left: 0,
            height: '100vh',
            width: DETECTION_ZONE_WIDTH, 
            zIndex: theme.zIndex.drawer + 2, 
            // Optionnel: background: 'rgba(255,0,0,0.1)', // Pour visualiser la zone en dev
            cursor: 'pointer', 
          }}
        />
      )}
      
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        drawerWidthCollapsed={DRAWER_WIDTH_COLLAPSED}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        isSliding={mobileOpen && !isMobile}
      />

      <ContentWrapper drawerWidth={currentDrawerWidth}>
        <Navbar
          isScrolled={isScrolled}
          onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
          drawerWidth={currentDrawerWidth}
        />

        <MainContent
          key={location.pathname}
          initial="hidden"
          animate="visible"
          // drawerWidth={currentDrawerWidth} 
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