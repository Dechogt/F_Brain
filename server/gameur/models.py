from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Gamer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    pseudo = models.CharField(max_length=50)
    avatar = models.ImageField(upload_to='avatars/')
    level = models.IntegerField(default=1)
    points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.pseudo

class Game(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50)
    icon = models.ImageField(upload_to='games/')

    def __str__(self):
        return self.name

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
        unique_together = ['gamer', 'game']  # Un gamer ne peut avoir qu'une seule relation par jeu

    def __str__(self):
        return f"{self.gamer.pseudo} - {self.game.name}"