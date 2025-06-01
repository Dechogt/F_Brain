import { Box, Typography, Grid, useTheme } from '@mui/material'
import { motion, useAnimation, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'

const stats = [
  { label: 'Gamers actifs', value: 12894 },
  { label: 'Parties jouées', value: 98342 },
  { label: 'Jeux disponibles', value: 56 },
  { label: 'Nouveaux membres ce mois', value: 1342 }
]

const Counter = ({ value }) => {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      controls.start({ count: value })
    }
  }, [isInView, controls, value])

  return (
    <motion.span
      ref={ref}
      initial={{ count: 0 }}
      animate={controls}
      transition={{ duration: 2, ease: 'easeOut' }}
    >
      {Math.floor(value).toLocaleString()}
    </motion.span>
  )
}

const StatsCounter = () => {
  const theme = useTheme()

  return (
    <Box sx={{ py: 8, backgroundColor: theme.palette.background.cards }}>
      <Grid container spacing={4} justifyContent="center">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index} textAlign="center">
            <Typography
              variant="h3"
              color="primary"
              component={motion.div}
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ fontWeight: 'bold' }}
            >
              <Counter value={stat.value} />
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {stat.label}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default StatsCounter
