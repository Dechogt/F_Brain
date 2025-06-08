import { Box, Typography, Button, Grid, useTheme, Container } from '@mui/material' 
import { motion } from 'framer-motion'
import GameCarousel from '../components/Gaming/GameCarousel'
import GamerGrid from '../components/Gaming/GamerGrid'
import StatsCounter from '../components/Gaming/StatsCounter'
import GameStats from '../components/Gaming/GameStats' 

const HomePage = () => {
  const theme = useTheme()

  const gameStatsData = [
    { label: 'Gamers Actifs', value: '12,894' },
    { label: 'Parties Jouées', value: '98,342' },
    { label: 'Tournois Terminés', value: '567' },
    { label: 'Jeux Supportés', value: '50+' },
  ];


  return (
    
    <Container maxWidth="lg"> 
      <Box sx={{ overflow: 'hidden' }}> 
        
        <Box
          component={motion.section}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          sx={{
            textAlign: 'center',
            py: 10,
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
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

        <StatsCounter />

        <Box sx={{ my: 8 }}> 
           <Typography variant="h4" align="center" sx={{ mb: 4 }}>
             Statistiques Clés
           </Typography>
           
           <GameStats stats={gameStatsData} /> 
        </Box>

        <GameCarousel />

        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" sx={{ mb: 4 }}>
            Les meilleurs joueurs du moment
          </Typography>
          {/* Assure-toi de passer les données des gamers à GamerGrid */}
          {/* <GamerGrid gamers={yourGamersData} loading={yourLoadingState} /> */}
          {/* Pour l'instant, si GamerGrid gère son propre chargement/données, ça peut rester comme ça */}
          <GamerGrid />
        </Box>
      </Box>
    </Container>
  )
}

export default HomePage