import { useRef } from 'react'
import { Box, IconButton, Typography } from '@mui/material'
import { motion, useScroll, useTransform } from 'framer-motion'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import GameBadge from './GameBadge'

const games = [
  { name: 'Valorant', level: 85, hours: 320 },
  { name: 'League of Legends', level: 72, hours: 450 },
  { name: 'CS:GO', level: 63, hours: 180 },
  { name: 'Fortnite', level: 58, hours: 210 },
  { name: 'Dota 2', level: 42, hours: 95 }
]

const GameCarousel = () => {
  // const theme = useTheme()
  const ref = useRef(null)
  const { scrollXProgress } = useScroll({ container: ref })
  const x = useTransform(scrollXProgress, [0, 1], ['0%', '-50%'])

  return (
    <Box sx={{ my: 6 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Jeux Populaires
      </Typography>
      
      <Box sx={{ position: 'relative' }}>
        <IconButton
          sx={{ 
            position: 'absolute', 
            left: 0, 
            top: '50%', 
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.default'
            }
          }}
        >
          <ChevronLeftIcon />
        </IconButton>
        
        <Box
          ref={ref}
          component={motion.div}
          style={{ x }}
          sx={{
            display: 'flex',
            gap: 3,
            px: 2,
            py: 4,
            overflowX: 'hidden',
            scrollSnapType: 'x mandatory'
          }}
        >
          {games.map((game, index) => ( 
            <Box
              key={index} 
              sx={{
                flexShrink: 0,
                scrollSnapAlign: 'start'
              }}
            >
              <GameBadge
                game={game.name}
                level={game.level}
                hours={game.hours}
              />
            </Box>
          ))}
        </Box>
        
        <IconButton
          sx={{
            position: 'absolute',
            left: 0, // Positionne à gauche
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 2,
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'background.default'
            }
          }}
        >
          <ChevronRightIcon />
        </IconButton>
      </Box>
    </Box>
  )
}

export default GameCarousel