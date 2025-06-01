import { Box, Avatar, Typography, Tabs, Tab, Chip } from '@mui/material'
import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import GameBadge from '../components/Gaming/GameBadge'

const Profile = () => {
  const { user } = useAuth0()
  const [tabValue, setTabValue] = useState(0)

  const games = [
    { name: 'Valorant', level: 85, hours: 320 },
    { name: 'League of Legends', level: 72, hours: 450 },
    { name: 'CS:GO', level: 63, hours: 180 }
  ]

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <Avatar
          src={user?.picture}
          sx={{ width: 100, height: 100, mr: 3 }}
        />
        <Box>
          <Typography variant="h4">{user?.nickname || user?.name}</Typography>
          <Chip 
            label="Niveau 78" 
            color="primary" 
            sx={{ mt: 1 }} 
          />
        </Box>
      </Box>

      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Statistiques" />
        <Tab label="Jeux" />
        <Tab label="Récompenses" />
      </Tabs>

      {tabValue === 0 && (
        <Box>
          {/* Statistiques utilisateur */}
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Mes Jeux
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {games.map((game) => (
              <GameBadge 
                key={game.name}
                game={game.name}
                level={game.level}
                hours={game.hours}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default Profile