import { useState } from 'react'
import { Box, Typography, TextField, MenuItem } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import useLeaderboard from '../hooks/useLeaderboard'

const Leaderboard = () => {
  const [gameFilter, setGameFilter] = useState('all')
  const { players, loading } = useLeaderboard(gameFilter)

  const columns = [
    { field: 'rank', headerName: 'Rank', width: 80 },
    { 
      field: 'avatar', 
      headerName: 'Avatar', 
      width: 100,
      renderCell: (params) => (
        <img 
          src={params.value} 
          alt="avatar" 
          style={{ width: 50, height: 50, borderRadius: '50%' }} 
        />
      )
    },
    { field: 'username', headerName: 'Pseudo', width: 150 },
    { field: 'mainGame', headerName: 'Jeu Principal', width: 150 },
    { field: 'level', headerName: 'Niveau', width: 120 },
    { field: 'winRate', headerName: 'Win Rate %', width: 120 },
    { field: 'totalPoints', headerName: 'Points', width: 120 }
  ]

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <Typography variant="h4" gutterBottom>
        Classement des Joueurs
      </Typography>
      
      <TextField
        select
        label="Filtrer par jeu"
        value={gameFilter}
        onChange={(e) => setGameFilter(e.target.value)}
        sx={{ mb: 3, width: 200 }}
      >
        <MenuItem value="all">Tous les jeux</MenuItem>
        <MenuItem value="valorant">Valorant</MenuItem>
        <MenuItem value="lol">League of Legends</MenuItem>
        <MenuItem value="csgo">CS:GO</MenuItem>
      </TextField>

      <DataGrid
        rows={players}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10]}
        disableSelectionOnClick
        sx={{
          '& .MuiDataGrid-cell': {
            borderBottom: 'none'
          },
          '& .rank-1': {
            backgroundColor: 'rgba(255, 215, 0, 0.1)'
          },
          '& .rank-2': {
            backgroundColor: 'rgba(192, 192, 192, 0.1)'
          },
          '& .rank-3': {
            backgroundColor: 'rgba(205, 127, 50, 0.1)'
          }
        }}
        getRowClassName={(params) => `rank-${params.row.rank}`}
      />
    </Box>
  )
}

export default Leaderboard

// // Exemple d'utilisation dans Leaderboard.jsx Ceci est un exemple de code pour une page de classement de joueurs dans une application de jeu. Il utilise Material-UI pour le style et la mise en page, ainsi que le composant DataGrid pour afficher les données des joueurs. Le hook `useLeaderboard` est utilisé pour récupérer les données des joueurs, qui peuvent être filtrées par jeu principal.
// import GamerGrid from '../components/Gaming/GamerGrid'

// const Leaderboard = () => {
//   const { gamers, loading } = useLeaderboard()
  
//   return (
//     <Box>
//       <GamerGrid gamers={gamers} loading={loading} />
//     </Box>
//   )
// }