import { Box } from '@mui/material'
import { motion } from 'framer-motion'

const GameBackground = () => {
  return (
    <>
      {[...Array(15)].map((_, i) => (
        <Box
          key={i}
          component={motion.div}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 20 + i * 3,
            repeat: Infinity,
            ease: 'linear'
          }}
          sx={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${i % 2 === 0 ? '#FF6B35' : '#00BCD4'}10 0%, transparent 70%)`,
            pointerEvents: 'none',
            zIndex: 0
          }}
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}
        />
      ))}
    </>
  )
}

export default GameBackground