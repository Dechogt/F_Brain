
from django.http import JsonResponse
from .auth_utils import auth0_required
# from .models import GamerProfile # <-- Supprime ou commente cette ligne
from .models import Gamer, Game, GamerGame # <-- Importe tes modèles avec les bons noms
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model # Pour accéder au modèle User

User = get_user_model() # Obtient le modèle User

# Exemple de vue pour récupérer le profil de l'utilisateur connecté
@auth0_required
def user_profile_view(request):
    try:
        # Récupère le Gamer lié à l'utilisateur authentifié
        # Utilise le nom de modèle correct : Gamer
        gamer = Gamer.objects.get(user=request.user)
        # Sérialise le profil en dictionnaire pour le renvoyer en JSON
        gamer_data = {
            'id': gamer.id, # Ajoute l'ID du gamer
            'pseudo': gamer.pseudo,
            'avatar': gamer.avatar.url if gamer.avatar else None,
            'level': gamer.level,
            'points': gamer.points,
            # 'rank': gamer.rank, # Si tu as un champ rank
            'created_at': gamer.created_at.isoformat(), # Sérialise la date
            # Utilise les propriétés @property pour les jeux
            'topGames': [game.name for game in gamer.top_games], # Accède à la propriété top_games
            'favoriteGame': gamer.favorite_game.name if gamer.favorite_game else None, # Accède à la propriété favorite_game
            # Adapte selon les champs de ton modèle Gamer
        }
        return JsonResponse(gamer_data)
    except Gamer.DoesNotExist: # Utilise le nom de modèle correct ici aussi
        # Si l'utilisateur n'a pas encore de profil gamer
        return JsonResponse({'detail': 'Gamer profile not found.'}, status=404)
    except Exception as e:
        print(f"Erreur dans user_profile_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Exemple de vue pour créer/mettre à jour le profil gamer
@auth0_required
def gamer_create_update_view(request):
    # ... (logique à implémenter)
    pass # À implémenter

# Exemple de vue pour la liste des gamers (classement)
def gamer_list_view(request):
    try:
        # Récupère tous les gamers, triés par points par exemple
        gamers = Gamer.objects.all().order_by('-points')
        # Sérialise la liste des gamers
        gamers_data = []
        for gamer in gamers:
             gamers_data.append({
                'id': gamer.id,
                'pseudo': gamer.pseudo,
                'avatar': gamer.avatar.url if gamer.avatar else None,
                'level': gamer.level,
                'points': gamer.points,
                # 'rank': gamer.rank, # Si tu as un champ rank
                # Utilise les propriétés @property pour les jeux
                'topGames': [game.name for game in gamer.top_games],
                'favoriteGame': gamer.favorite_game.name if gamer.favorite_game else None,
                # Adapte selon les champs de ton modèle Gamer
            })
        return JsonResponse(gamers_data, safe=False)
    except Exception as e:
        print(f"Erreur dans gamer_list_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)