import { Box, Typography, Avatar, Chip } from '@mui/material'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'
import { useTheme } from '@mui/material/styles'

const Profile = () => {
  const { user, isAuthenticated } = useAuth0()
  const theme = useTheme()

  if (!isAuthenticated) return null

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        bgcolor: 'background.cards',
        borderRadius: 2,
        mb: 2
      }}
    >
      <Avatar
        src={user?.picture}
        sx={{
          width: 56,
          height: 56,
          border: `2px solid ${theme.palette.primary.main}`
        }}
      />
      
      <Box>
        <Typography variant="subtitle1" noWrap>
          {user?.nickname || user?.name}
        </Typography>
        <Chip
          label="Niveau 1"
          size="small"
          sx={{
            mt: 0.5,
            bgcolor: 'primary.dark',
            color: 'white',
            fontSize: '0.7rem'
          }}
        />
      </Box>
    </Box>
  )
}

export default Profile