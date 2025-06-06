import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  useTheme,
  useMediaQuery,
  Toolbar,
} from '@mui/material'
import {
  Home,
  Leaderboard,
  Dashboard,
  Person,
  Settings,
  SportsEsports,
  TrendingUp,
  Group,
  ChevronLeft,
  ChevronRight,
  Logout,
} from '@mui/icons-material'
import { useAuth } from '../../hooks/useAuth.js'

// Retire les constantes si tu les passes en props depuis le Layout
// const DRAWER_WIDTH = 280
// const DRAWER_WIDTH_COLLAPSED = 70

// Reçoit les props du Layout
export const Sidebar = ({
  drawerWidth, // <-- Utilise cette prop
  drawerWidthCollapsed, // <-- Utilise cette prop
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, logout } = useAuth()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  // ... (menuItems, userMenuItems, handleNavigation, handleLogout, isActive) ...

  const menuItems = [
    {
      title: 'Accueil',
      icon: <Home />,
      path: '/',
      color: '#00E676',
      public: true,
    },
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      color: '#00B8D4',
      requireAuth: true,
    },
    {
      title: 'Classement',
      icon: <Leaderboard />,
      path: '/ranking',
      color: '#FFB300',
      public: true,
    },
    {
      title: 'Gaming Hub',
      icon: <SportsEsports />,
      path: '/gaming',
      color: '#FF6B35',
      public: true,
    },
    {
      title: 'Statistiques',
      icon: <TrendingUp />,
      path: '/stats',
      color: '#7C4DFF',
      requireAuth: true,
    },
    {
      title: 'Communauté',
      icon: <Group />,
      path: '/community',
      color: '#FF4081',
      public: true,
    },
  ];

  const userMenuItems = [
    {
      title: 'Mon Profil',
      icon: <Person />,
      path: '/profile',
      color: '#00E676',
    },
    {
      title: 'Paramètres',
      icon: <Settings />,
      path: '/settings',
      color: '#B0BEC5',
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;


  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(145deg, #1A1F3A 0%, #242B4D 100%)',
        borderRight: `1px solid rgba(0, 230, 118, 0.1)`,
      }}
    >
      {/* Espace pour la Toolbar de la Navbar */}
      <Toolbar sx={{ minHeight: 80 }}>
         {!isMobile && (
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Box
               sx={{
                 width: 40,
                 height: 40,
                 borderRadius: '12px',
                 background: 'linear-gradient(45deg, #00E676, #00B8D4)',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 flexShrink: 0,
               }}
             >
               <SportsEsports sx={{ color: '#000', fontSize: 24 }} />
             </Box>

             {!collapsed && (
               <Box>
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
                 <Typography variant="caption" color="text.secondary">
                   v1.0.0
                 </Typography>
               </Box>
             )}
           </Box>
         )}
         {!isMobile && (
           <IconButton
             onClick={() => setCollapsed(!collapsed)}
             sx={{
               ml: 'auto',
               color: 'text.secondary',
               '&:hover': {
                 color: 'primary.main',
                 backgroundColor: 'rgba(0, 230, 118, 0.1)',
               },
             }}
           >
             {collapsed ? <ChevronRight /> : <ChevronLeft />}
           </IconButton>
         )}
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(0, 230, 118, 0.1)' }} />


      {/* User info si connecté */}
      {isAuthenticated && user && (
        <Box
          sx={{
            p: collapsed ? 1 : 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            borderBottom: `1px solid rgba(0, 230, 118, 0.1)`,
          }}
        >
          <Avatar
            src={user.avatar}
            sx={{
              width: collapsed ? 32 : 48,
              height: collapsed ? 32 : 48,
              border: '2px solid',
              borderColor: 'primary.main',
              flexShrink: 0,
            }}
          >
            {user.displayName?.[0]?.toUpperCase()}
          </Avatar>

          {!collapsed && (
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  color: 'text.primary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {user.displayName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                {user.isAdmin && (
                  <Chip
                    label="Admin"
                    size="small"
                    sx={{
                      backgroundColor: 'error.main',
                      color: 'white',
                      fontSize: '0.6rem',
                      height: 16,
                    }}
                  />
                )}
                <Chip
                  label="En ligne"
                  size="small"
                  sx={{
                    backgroundColor: 'success.main',
                    color: 'white',
                    fontSize: '0.6rem',
                    height: 16,
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* Menu principal */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {menuItems.map((item) => {
          if (item.requireAuth && !isAuthenticated) return null;

          const active = isActive(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip
                title={collapsed ? item.title : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    mb: 0.5,
                    backgroundColor: active ? 'rgba(0, 230, 118, 0.15)' : 'transparent',
                    border: active ? '1px solid rgba(0, 230, 118, 0.3)' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 230, 118, 0.1)',
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? item.color : 'text.secondary',
                      minWidth: collapsed ? 'auto' : 40,
                      mr: collapsed ? 0 : 2,
                      transition: 'color 0.3s ease',
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary={item.title}
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontWeight: active ? 600 : 400,
                          color: active ? item.color : 'text.primary',
                          fontSize: '0.9rem',
                        },
                      }}
                    />
                  )}

                  {active && !collapsed && (
                    <Box
                      sx={{
                        width: 4,
                        height: 20,
                        backgroundColor: item.color,
                        borderRadius: 2,
                        ml: 1,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>

      {/* Menu utilisateur si connecté */}
      {isAuthenticated && (
        <>
          <Divider sx={{ borderColor: 'rgba(0, 230, 118, 0.1)', mx: 2 }} />
          <List sx={{ px: 1, py: 1 }}>
            {userMenuItems.map((item) => {
              const active = isActive(item.path);

              return (
                <ListItem key={item.path} disablePadding>
                  <Tooltip
                    title={collapsed ? item.title : ''}
                    placement="right"
                    arrow
                  >
                    <ListItemButton
                      onClick={() => handleNavigation(item.path)}
                      sx={{
                        borderRadius: 2,
                        mx: 0.5,
                        mb: 0.5,
                        backgroundColor: active ? 'rgba(0, 230, 118, 0.15)' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'rgba(0, 230, 118, 0.1)',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: active ? item.color : 'text.secondary',
                          minWidth: collapsed ? 'auto' : 40,
                          mr: collapsed ? 0 : 2,
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      {!collapsed && (
                        <ListItemText
                          primary={item.title}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.85rem',
                              color: 'text.secondary',
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
              );
            })}

            {/* Bouton de déconnexion */}
            <ListItem disablePadding>
              <Tooltip
                title={collapsed ? 'Déconnexion' : ''}
                placement="right"
                arrow
              >
                <ListItemButton
                  onClick={handleLogout}
                  sx={{
                    borderRadius: 2,
                    mx: 0.5,
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'error.main',
                      minWidth: collapsed ? 'auto' : 40,
                      mr: collapsed ? 0 : 2,
                    }}
                  >
                    <Logout />
                  </ListItemIcon>

                  {!collapsed && (
                    <ListItemText
                      primary="Déconnexion"
                      sx={{
                        '& .MuiListItemText-primary': {
                          fontSize: '0.85rem',
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </>
      )}
    </Box>
  );

  return (
    <>
      {/* Desktop Drawer */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? drawerWidthCollapsed : drawerWidth, // <-- Utilise les props ici
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: collapsed ? drawerWidthCollapsed : drawerWidth, // <-- Utilise les props ici
              boxSizing: 'border-box',
              transition: 'width 0.3s ease',
              overflowX: 'hidden',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth, // <-- Utilise la prop ici (largeur dépliée pour mobile)
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;