import { Button } from '@mui/material'
import { motion } from 'framer-motion'
import { useAuth0 } from '@auth0/auth0-react'
import { useTheme } from '@mui/material/styles'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0()
  const theme = useTheme()

  return (
    <Button
      component={motion.button}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => loginWithRedirect()}
      sx={{
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.accent.purple} 100%)`,
        color: 'white',
        fontWeight: 'bold',
        px: 4,
        py: 1,
        borderRadius: 2,
        boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)',
        textTransform: 'none',
        fontSize: '1rem'
      }}
    >
      Connexion
    </Button>
  )
}

export default LoginButton