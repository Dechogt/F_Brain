import { Box, Typography, Button, Grid, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import GameCarousel from '../components/Gaming/GameCarousel'
import StatsCounter from '../components/Gaming/StatsCounter'

const Home = () => {
  const theme = useTheme()

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        component={motion.section}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        sx={{
          textAlign: 'center',
          py: 10,
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        }}
      >
        <Typography 
          variant="h1" 
          component={motion.h1}
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          sx={{ mb: 3 }}
        >
          Bienvenue sur <span style={{ color: theme.palette.primary.main }}>Gaming Followers</span>
        </Typography>
        
        <Typography variant="h5" sx={{ mb: 4, maxWidth: '800px', mx: 'auto' }}>
          La plateforme ultime pour les gamers compétitifs
        </Typography>

        <Button 
          variant="contained" 
          size="large"
          component={motion.button}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          sx={{
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            fontSize: '1.1rem',
            px: 4,
            py: 1.5
          }}
        >
          Commencer l'aventure
        </Button>
      </Box>

      {/* Live Stats */}
      <StatsCounter />

      {/* Featured Games */}
      <GameCarousel />

      {/* Top Gamers Preview */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Les meilleurs joueurs du moment
        </Typography>
        {/* Ici vous intégrerez le composant GamerGrid */}
      </Box>
    </Box>
  )
}

export default Home