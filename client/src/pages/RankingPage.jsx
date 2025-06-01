import { Box, Typography, Container, Tabs, Tab, TextField, MenuItem } from '@mui/material'
import { useState } from 'react'
import GamerGrid from '../components/Gaming/GamerGrid'
import GameBadge from '../components/Gaming/GameBadge'
import { motion } from 'framer-motion'

const RankingPage = () => {
  const [tabValue, setTabValue] = useState(0)
  const [gameFilter, setGameFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Données temporaires - à remplacer par votre appel API
  const gamers = [
    {
      id: 1,
      pseudo: 'NinjaX',
      avatar: '/avatars/1.jpg',
      level: 95,
      points: 12450,
      rank: 1,
      topGames: ['Valorant', 'Fortnite', 'CS:GO'],
      favoriteGame: { name: 'Valorant', color: '#FF4655' }
    },
    // ... autres joueurs
  ]

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const filteredGamers = gamers.filter(gamer =>
    gamer.pseudo.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (gameFilter === 'all' || gamer.topGames.includes(gameFilter))
  )

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{ mb: 6, textAlign: 'center' }}
      >
        <Typography 
          variant="h3" 
          sx={{ 
            mb: 2,
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF6B35 30%, #FFD700 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Classement des Joueurs
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Découvrez les meilleurs joueurs de la communauté
        </Typography>
      </Box>

      <Box sx={{ 
        bgcolor: 'background.cards',
        borderRadius: 3,
        p: 3,
        mb: 4,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          textColor="secondary"
          indicatorColor="secondary"
          sx={{ mb: 3 }}
        >
          <Tab label="Tous les joueurs" />
          <Tab label="Par jeu" />
          <Tab label="Amis" />
        </Tabs>

        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          mb: 4,
          justifyContent: 'center'
        }}>
          <TextField
            label="Rechercher un joueur"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ 
              width: 300,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper'
              }
            }}
          />

          <TextField
            select
            label="Filtrer par jeu"
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            size="small"
            sx={{ 
              width: 200,
              '& .MuiOutlinedInput-root': {
                bgcolor: 'background.paper'
              }
            }}
          >
            <MenuItem value="all">Tous les jeux</MenuItem>
            <MenuItem value="Valorant">Valorant</MenuItem>
            <MenuItem value="Fortnite">Fortnite</MenuItem>
            <MenuItem value="CS:GO">CS:GO</MenuItem>
          </TextField>
        </Box>

        {tabValue === 1 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Top Jeux</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {['Valorant', 'Fortnite', 'CS:GO', 'League of Legends'].map(game => (
                <GameBadge 
                  key={game}
                  game={game}
                  level={Math.floor(Math.random() * 100)}
                  hours={Math.floor(Math.random() * 500)}
                />
              ))}
            </Box>
          </Box>
        )}

        <GamerGrid gamers={filteredGamers} loading={false} />
      </Box>

      {/* Section Top 3 */}
      <Box sx={{ mt: 8 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
          Le Podium
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 4,
          flexWrap: 'wrap'
        }}>
          {gamers.slice(0, 3).map((gamer, index) => (
            <Box
              key={gamer.id}
              component={motion.div}
              whileHover={{ y: -10 }}
              sx={{
                width: 280,
                textAlign: 'center',
                position: 'relative',
                order: index === 1 ? 0 : index === 0 ? 1 : 2,
                mt: index === 1 ? -4 : 0
              }}
            >
              <Box
                sx={{
                  height: index === 1 ? 120 : 80,
                  bgcolor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h1" sx={{ color: 'black' }}>
                  {index + 1}
                </Typography>
              </Box>
              <GamerCard gamer={gamer} />
            </Box>
          ))}
        </Box>
      </Box>
    </Container>
  )
}

export default RankingPage