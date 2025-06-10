import { Box, Typography, LinearProgress, useTheme } from '@mui/material'
import { motion } from 'framer-motion'

const GameProgress = ({ game, level, progress }) => {
  const theme = useTheme()

  // Fonction pour obtenir une couleur basée sur le nom du jeu (peut être la même que dans GameBadge)
  const getGameColor = (gameName) => {
    const colors = {
      'Valorant': '#FF4655',
      'League of Legends': '#0AC8B9',
      'CS:GO': '#F5B225',
      'Fortnite': '#C3B1E1',
      'Dota 2': '#E54D42',
      // Ajoute d'autres jeux ici
    };
    // Utilise une couleur par défaut si le jeu n'est pas dans la liste
    return colors[gameName] || theme.palette.primary.main;
  };

  // Calculer la valeur de la barre de progression (entre 0 et 100)
  // Assumes que 'progress' est une valeur représentant la progression dans le niveau actuel
  // Tu devras peut-être ajuster cette logique en fonction de comment tes stats sont structurées
  const progressBarValue = Math.min(Math.max(progress, 0), 100); // Assure que la valeur est entre 0 et 100


  return (
    <Box
      component={motion.div}
      whileHover={{ scale: 1.03 }}
      sx={{
        p: 2,
        bgcolor: 'background.paper', // Utilise la couleur de fond des cartes du thème
        borderRadius: 2,
        width: 250, // Largeur fixe (ajuste si nécessaire)
        textAlign: 'left',
        borderLeft: `4px solid ${getGameColor(game)}`, // Bordure colorée basée sur le jeu
        boxShadow: theme.shadows[2], // Ajoute une ombre légère
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        {game} {/* Nom du jeu */}
      </Typography>

      <Box sx={{ mb: 1 }}>
        <Typography variant="caption" display="block" color="text.secondary">
          Niveau {level} {/* Niveau du joueur dans ce jeu */}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progressBarValue} // Utilise la valeur calculée
          sx={{
            height: 8, // Hauteur de la barre
            borderRadius: 4, // Bords arrondis
            bgcolor: 'rgba(255, 255, 255, 0.1)', // Couleur de fond de la barre
            '& .MuiLinearProgress-bar': {
              bgcolor: getGameColor(game), // Couleur de la barre basée sur le jeu
              transition: 'transform 0.4s linear', // Animation de la progression
            },
          }}
        />
        {/* Optionnel: Afficher le pourcentage ou la valeur de progression */}
        {/* <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
           {progressBarValue}%
        </Typography> */}
      </Box>

      {/* Tu peux ajouter d'autres stats spécifiques au jeu ici si nécessaire */}
      {/* <Typography variant="body2" color="text.primary">
          Kills: {stats?.valorantKills}
      </Typography> */}

    </Box>
  );
};

export default GameProgress;