import { Grid, Box, Typography } from '@mui/material'
import GamerCard from './GamerCard'
import LoadingSpinner from '../Common/LoadingSpinner'

const GamerGrid = ({ gamers, loading }) => {
  if (loading) return <LoadingSpinner />

  if (!gamers?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6">Aucun joueur trouvé</Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={3}>
      {gamers.map((gamer) => (
        <Grid item key={gamer.id} xs={12} sm={6} md={4} lg={3}>
          <GamerCard gamer={gamer} />
        </Grid>
      ))}
    </Grid>
  )
}

export default GamerGrid