import { Box, Typography, Container, useTheme } from '@mui/material'
import { motion } from 'framer-motion'
import LoginButton from '../components/Auth/LoginButton'
import GameBackground from '../components/Gaming/GameBackground'

const LoginPage = () => {
  const theme = useTheme()

  return (
    <Box sx={{ 
      minHeight: '90vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <GameBackground />
      
      <Container maxWidth="md">
        <Box
          component={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          sx={{
            bgcolor: 'rgba(15, 15, 15, 0.24)',
            p: 6,
            borderRadius: 4,
            boxShadow: '0 0 30px rgba(58, 4, 236, 0.2)',
            border: '1px solid rgba(37, 9, 195, 0.15)',
            textAlign: 'center',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="h2" 
            component={motion.h2}
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            sx={{
              mb: 3,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 'bold'
            }}
          >
            Bienvenue sur Gaming Followers
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Connectez-vous pour accéder à votre profil, suivre vos statistiques et défier vos amis !
          </Typography>
          
          <Box
            component={motion.div}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LoginButton />
          </Box>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {['🎮', '🏆', '👾', '🎯'].map((emoji, i) => (
              <Typography
                key={i}
                component={motion.span}
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3
                }}
                sx={{ fontSize: '2rem' }}
              >
                {emoji}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default LoginPage