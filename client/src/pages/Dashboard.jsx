import { Box, Typography, CircularProgress } from '@mui/material'
import { useAuth0 } from '@auth0/auth0-react'
import useUserStats from '../hooks/useUserStats'
import GameProgress from '../components/Gaming/GameProgress'

const Dashboard = () => {
  const { user } = useAuth0()
  const { stats, loading, error } = useUserStats(user?.sub)

  if (loading) return <CircularProgress />

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mon Tableau de Bord
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        <GameProgress
          game="Valorant" 
          level={stats?.valorantLevel || 0} 
          progress={stats?.valorantProgress || 0} 
        />
        
        <GameProgress 
          game="League of Legends" 
          level={stats?.lolLevel || 0} 
          progress={stats?.lolProgress || 0} 
        />
      </Box>

      {/* Autres widgets du dashboard */}
    </Box>
  )
}

export default Dashboard