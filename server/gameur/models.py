from django.db import models
from django.contrib.auth.models import User # Utilise le modèle User par défaut
from django.conf import settings # Importe settings pour référence future si besoin

# Create your models here.

class Game(models.Model):
    name = models.CharField(max_length=100, unique=True) # Assure l'unicité du nom du jeu
    category = models.CharField(max_length=50)
    icon = models.ImageField(upload_to='games/', blank=True, null=True) # Rendre l'icône optionnelle

    def __str__(self):
        return self.name

class Gamer(models.Model):
    # Lien vers l'utilisateur Django par défaut
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='gamer_profile')

    # Champ pour stocker l'identifiant Auth0 (sub)
    # C'est crucial pour lier l'utilisateur Auth0 à son profil Django
    # Ajoute unique=True et blank=True, null=True car tous les utilisateurs User n'auront pas forcément un auth0_id
    auth0_id = models.CharField(max_length=255, unique=True, blank=True, null=True)

    pseudo = models.CharField(max_length=50, unique=True) # Assure l'unicité du pseudo
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True) # Rendre l'avatar optionnel
    level = models.IntegerField(default=1)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    # Tu peux ajouter un champ pour le rang si tu le stockes directement
    # rank = models.IntegerField(default=0)

    def __str__(self):
        return self.pseudo

    # Propriété pour obtenir les jeux préférés (basé sur GamerGame)
    # Tu peux définir la logique ici (ex: les 3 jeux avec le plus d'heures jouées)
    @property
    def top_games(self):
        # Exemple: retourne les 3 jeux avec le plus d'heures jouées
        gamer_games = self.gamergame_set.order_by('-hours_played')[:3]
        return [gg.game for gg in gamer_games] # Retourne les objets Game

    # Propriété pour obtenir le jeu favori (basé sur GamerGame)
    # Tu peux définir la logique ici (ex: le jeu avec le plus d'heures jouées ou le niveau de compétence le plus élevé)
    @property
    def favorite_game(self):
        # Exemple: retourne le jeu avec le plus d'heures jouées
        gamer_game = self.gamergame_set.order_by('-hours_played').first()
        return gamer_game.game if gamer_game else None # Retourne l'objet Game ou None


class GamerGame(models.Model):
    gamer = models.ForeignKey(Gamer, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    skill_level = models.IntegerField(choices=[
        (1, 'Débutant'),
        (2, 'Intermédiaire'),
        (3, 'Avancé'),
        (4, 'Expert'),
        (5, 'Pro')
    ])
    hours_played = models.IntegerField(default=0)

    class Meta:
        unique_together = ['gamer', 'game']

    def __str__(self):
        return f"{self.gamer.pseudo} - {self.game.name}"