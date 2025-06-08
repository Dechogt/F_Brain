import { Box, Typography, Stack } from '@mui/material'
import { motion } from 'framer-motion'

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  })
}

const GameStats = ({ stats }) => { 
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }} 
      spacing={{ xs: 2, sm: 4 }} 
      justifyContent="center" 
      alignItems={{ xs: 'center', sm: 'flex-start' }} 
    >
      {stats.map((stat, index) => (
        <Box
          key={stat.label} 
          component={motion.div}
          variants={statVariants}
          initial="hidden"
          animate="visible"
          custom={index}
          sx={{
            textAlign: 'center',
            p: 2,
            minWidth: 100,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid rgba(0, 230, 118, 0.1)',
          }}
        >
          <Typography
            variant="h4"
            color="primary"
            sx={{
              fontWeight: 'bold',
              mb: 1
            }}
          >
            {stat.value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stat.label}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

export default GameStats