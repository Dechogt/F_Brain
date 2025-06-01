import { Box, Typography, LinearProgress, Avatar } from '@mui/material'
import { motion } from 'framer-motion'

const GameBadge = ({ game, level, hours }) => {
  const getGameColor = (gameName) => {
    const colors = {
      'Valorant': '#FF4655',
      'League of Legends': '#0AC8B9',
      'CS:GO': '#F5B225',
      'Fortnite': '#C3B1E1',
      'Dota 2': '#E54D42'
    }
    console.log(gameName)
    return colors[game] || '#9C27B0'
  }
  

  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.03 }}
      sx={{
        p: 2,
        bgcolor: 'background.cards',
        borderRadius: 2,
        width: 180,
        textAlign: 'center',
        borderLeft: `4px solid ${getGameColor(game)}`
      }}
    >
      <Avatar
        src={`/games/${game.toLowerCase().replace(/\s+/g, '-')}.png`}
        sx={{ 
          width: 60, 
          height: 60,
          mx: 'auto',
          mb: 1,
          bgcolor: 'background.paper'
        }}
      />
      
      <Typography variant="subtitle1" gutterBottom>
        {game}
      </Typography>
      
      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" display="block">
          Niveau {level}
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={(level % 100)} 
          sx={{ 
            height: 6,
            borderRadius: 3,
            '& .MuiLinearProgress-bar': {
              bgcolor: getGameColor(game)
            }
          }} 
        />
      </Box>
      
      <Typography variant="caption" color="text.secondary">
        {hours} heures
      </Typography>
    </Box>
  )
}

export default GameBadge