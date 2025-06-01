import { Button, Menu, MenuItem, Avatar } from '@mui/material'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { motion } from 'framer-motion'

const LogoutButton = () => {
  const { logout, user } = useAuth0()
  const [anchorEl, setAnchorEl] = useState(null)
  const open = Boolean(anchorEl)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <Button
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        onClick={handleClick}
        sx={{
          p: 0,
          minWidth: 'auto',
          borderRadius: '50%'
        }}
      >
        <Avatar
          src={user?.picture}
          sx={{
            width: 40,
            height: 40,
            border: '2px solid #FF6B35'
          }}
        />
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid #333',
            borderRadius: 2,
            mt: 1.5,
            minWidth: 180
          }
        }}
      >
        <MenuItem 
          onClick={() => logout({ returnTo: window.location.origin })}
          sx={{
            color: 'error.main',
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.08)'
            }
          }}
        >
          Déconnexion
        </MenuItem>
      </Menu>
    </>
  )
}

export default LogoutButton