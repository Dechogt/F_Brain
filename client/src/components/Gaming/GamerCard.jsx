import { Card, CardContent, Typography, Avatar, Box, Chip, Stack } from '@mui/material'
import { motion } from 'framer-motion'

const GamerCard = ({ gamer }) => {
  return (
    <Card 
      component={motion.div}
      whileHover={{ y: -5 }}
      sx={{ 
        height: '100%',
        background: 'linear-gradient(145deg, #2A2A2A 0%, #1A1A1A 100%)',
        border: '1px solid #333',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        height: 120,
        background: `linear-gradient(45deg, ${gamer.favoriteGame.color || '#FF6B35'} 0%, #0A0A0A 100%)`,
        position: 'relative'
      }}>
        <Avatar
          src={gamer.avatar}
          sx={{ 
            width: 80, 
            height: 80,
            position: 'absolute',
            bottom: -40,
            left: '50%',
            transform: 'translateX(-50%)',
            border: '3px solid #2A2A2A'
          }}
        />
      </Box>

      <CardContent sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          {gamer.pseudo}
        </Typography>
        
        <Typography color="text.secondary" gutterBottom>
          Niveau {gamer.level}
        </Typography>

        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 2 }}>
          <Chip 
            label={`#${gamer.rank}`} 
            color="primary" 
            size="small" 
          />
          <Chip 
            label={`${gamer.points} pts`} 
            variant="outlined" 
            size="small" 
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
          {gamer.topGames.slice(0, 3).map(game => (
            <Chip
              key={game}
              label={game}
              size="small"
              sx={{ 
                bgcolor: 'background.paper',
                color: 'text.primary',
                fontSize: '0.7rem'
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

export default GamerCard