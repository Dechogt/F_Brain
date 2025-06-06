import React, { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Search,
  Notifications,
  Settings,
  Person,
  Logout,
  DarkMode,
  LightMode,
  SportsEsports,
  EmojiEvents,
} from '@mui/icons-material'
import { useAuth, useTheme as useCustomTheme } from '../../hooks'
import LoginButton from '../Auth/LoginButton'
import LogoutButton from '../Auth/LogoutButton'
import Profile from '../Auth/Profile'

// Reçoit la largeur de la Sidebar en prop
export const Navbar = ({ onMobileMenuToggle, drawerWidth }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { user, isAuthenticated, logout } = useAuth()
  const { isDarkMode, toggleDarkMode } = useCustomTheme()

  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [searchValue, setSearchValue] = useState('')

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileMenuClose()
  };

  // Notifications factices pour la démo
  const notifications = [
    {
      id: 1,
      title: 'Nouveau défi disponible!',
      message: 'Un nouveau tournoi Valorant commence demain',
      time: '2 min',
      unread: true,
    },
    {
      id: 2,
      title: 'Classement mis à jour',
      message: 'Vous êtes maintenant #42 au classement général',
      time: '1h',
      unread: true,
    },
    {
      id: 3,
      title: 'Nouvel ami',
      message: 'GamerPro99 vous a ajouté comme ami',
      time: '3h',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <AppBar
      position="fixed" // Reste fixée en haut
      sx={{
        // Sur desktop (>= md), décale la Navbar de la largeur de la Sidebar
        // et réduit sa largeur en conséquence
        width: { md: `calc(100% - ${drawerWidth}px)` }, // Largeur = 100% - largeur Sidebar
        ml: { md: `${drawerWidth}px` }, // Marge à gauche égale à la largeur de la Sidebar
        zIndex: theme.zIndex.drawer + 1, // Assure qu'elle est au-dessus de la Sidebar
        background: 'rgba(26, 31, 58, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 230, 118, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Menu burger pour mobile */}
        {isMobile && (
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Logo et titre pour mobile (ou toujours si tu veux) */}
        {/* Sur desktop, le logo/titre est souvent dans la Sidebar */}
        {/* {isMobile && ( ... )} */}
         {!isMobile && ( // Affiche le logo/titre sur desktop si tu le veux dans la Navbar
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <SportsEsports sx={{ color: 'primary.main' }} />
             <Typography
               variant="h6"
               sx={{
                 fontWeight: 700,
                 background: 'linear-gradient(45deg, #00E676, #00B8D4)',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
               }}
             >
               Gaming Followers
             </Typography>
           </Box>
         )}


        {/* Barre de recherche */}
        <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 2 }}>
          <TextField
            placeholder="Rechercher des gamers, jeux, tournois..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 3,
                '& fieldset': {
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                },
                '&:hover fieldset': {
                  borderColor: 'rgba(0, 230, 118, 0.5)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>

        {/* Actions de droite */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Toggle thème */}
          <IconButton
            onClick={toggleDarkMode}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(0, 230, 118, 0.1)',
              },
            }}
          >
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>

          {/* Notifications */}
          <IconButton
            onClick={handleNotificationOpen}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(0, 230, 118, 0.1)',
              },
            }}
          >
            <Badge badgeContent={unreadCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Menu utilisateur ou bouton de connexion */}
          {isAuthenticated ? (
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                ml: 1,
                border: '2px solid transparent',
                borderRadius: '50%',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Avatar
                src={user?.avatar}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.displayName?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
          ) : (
            // Utilise le composant LoginButton que tu as déjà
            <LoginButton />
            // Ou si tu préfères le bouton direct:
            // <Button
            //   variant="contained"
            //   startIcon={<Person />}
            //   onClick={() => window.location.href = '/login'} // Redirection simple
            //   sx={{
            //     borderRadius: 3,
            //     textTransform: 'none',
            //     fontWeight: 600,
            //   }}
            // >
            //   Connexion
            // </Button>
          )}
        </Box>

        {/* Menu des notifications */}
        {/* ... (ton code de menu notifications) ... */}
         <Menu
           anchorEl={notificationAnchor}
           open={Boolean(notificationAnchor)}
           onClose={handleNotificationClose}
           PaperProps={{
             sx: {
               width: 360,
               maxHeight: 400,
               backgroundColor: 'background.paper',
               border: '1px solid rgba(0, 230, 118, 0.1)',
             },
           }}
         >
           <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 230, 118, 0.1)' }}>
             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Notifications color="primary" />
               Notifications
               {unreadCount > 0 && (
                 <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
               )}
             </Typography>
           </Box>

           {notifications.map((notification) => (
             <MenuItem
               key={notification.id}
               sx={{
                 flexDirection: 'column',
                 alignItems: 'flex-start',
                 backgroundColor: notification.unread ? 'rgba(0, 230, 118, 0.05)' : 'transparent',
                 borderLeft: notification.unread ? '3px solid #00E676' : '3px solid transparent',
                 '&:hover': {
                   backgroundColor: 'rgba(0, 230, 118, 0.1)',
                 },
               }}
             >
               <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                 <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                   {notification.title}
                 </Typography>
                 <Typography variant="caption" color="text.secondary">
                   {notification.time}
                 </Typography>
               </Box>
               <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                 {notification.message}
               </Typography>
             </MenuItem>
           ))}

           <Divider />
           <MenuItem sx={{ justifyContent: 'center', color: 'primary.main' }}>
             Voir toutes les notifications
           </MenuItem>
         </Menu>


        {/* Menu du profil utilisateur */}
        {/* ... (ton code de menu profil) ... */}
         <Menu
           anchorEl={anchorEl}
           open={Boolean(anchorEl)}
           onClose={handleProfileMenuClose}
           PaperProps={{
             sx: {
               width: 280,
               backgroundColor: 'background.paper',
               border: '1px solid rgba(0, 230, 118, 0.1)',
             },
           }}
         >
           {/* Info utilisateur */}
           <Box sx={{ p: 2, borderBottom: '1px solid rgba(0, 230, 118, 0.1)' }}>
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
               <Avatar
                 src={user?.avatar}
                 sx={{
                   width: 50,
                   height: 50,
                   bgcolor: 'primary.main',
                 }}
               >
                 {user?.displayName?.[0]?.toUpperCase()}
               </Avatar>
               <Box>
                 <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                   {user?.displayName}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   {user?.email}
                 </Typography>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                   <EmojiEvents sx={{ fontSize: 16, color: 'warning.main' }} />
                   <Typography variant="caption" color="warning.main">
                     Niveau 15 • Master
                   </Typography>
                 </Box>
               </Box>
             </Box>
           </Box>

           {/* Menu items */}
           <MenuItem onClick={() => { handleProfileMenuClose(); window.location.href = '/profile' }}>
             <Person sx={{ mr: 2, color: 'text.secondary' }} />
             Mon Profil
           </MenuItem>

           <MenuItem onClick={() => { handleProfileMenuClose(); window.location.href = '/settings' }}>
             <Settings sx={{ mr: 2, color: 'text.secondary' }} />
             Paramètres
           </MenuItem>

           <Divider />

           <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
             <Logout sx={{ mr: 2 }} />
             Déconnexion
           </MenuItem>
         </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar