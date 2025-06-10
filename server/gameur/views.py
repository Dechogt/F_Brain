from django.http import JsonResponse
from .auth_utils import auth0_required, serialize_gamer # Importe le décorateur et la fonction de sérialisation
from .models import Gamer, Game, GamerGame
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import json
from django.views.decorators.csrf import csrf_exempt

User = get_user_model()

# Vue pour récupérer le profil de l'utilisateur connecté
@auth0_required # Protégé par Auth0
def user_profile_view(request):
    """
    Récupère et renvoie les données du profil Gamer de l'utilisateur authentifié.
    """
    try:
        # request.user est l'utilisateur Django attaché par @auth0_required
        # Récupère le Gamer lié à cet utilisateur
        # Utilise get_object_or_404 pour renvoyer un 404 si le Gamer n'existe pas
        gamer = get_object_or_404(Gamer, user=request.user)

        # Utilise la fonction de sérialisation
        gamer_data = serialize_gamer(gamer, request)

        return JsonResponse(gamer_data)
    except Exception as e:
        # Gère les autres erreurs inattendues (hors Gamer.DoesNotExist géré par get_object_or_404)
        print(f"Erreur dans user_profile_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Exemple de vue pour créer/mettre à jour le profil gamer
@auth0_required # Protégé par Auth0
# @csrf_exempt # Décommenter si tu ne gères pas le CSRF sur cet endpoint
def gamer_create_update_view(request):
    """
    Crée ou met à jour le profil Gamer de l'utilisateur authentifié.
    """
    if request.method not in ['POST', 'PUT']:
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

    try:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)

        # Récupère le Gamer lié à l'utilisateur authentifié
        # Utilise get_object_or_404 pour vérifier si le Gamer existe déjà pour cet utilisateur
        # Si tu veux permettre la création, tu dois gérer le Gamer.DoesNotExist ici
        try:
            gamer = Gamer.objects.get(user=request.user)
            is_new = False
        except Gamer.DoesNotExist:
             # Si le Gamer n'existe pas, crée-le
             gamer = Gamer(user=request.user)
             is_new = True
             # Tu peux initialiser des champs par défaut ici si c'est une création
             gamer.pseudo = data.get('pseudo', request.user.username) # Pseudo par défaut
             gamer.level = data.get('level', 1) # Niveau par défaut
             gamer.points = data.get('points', 0) # Points par défaut


        # Met à jour les champs du Gamer avec les données reçues
        # Utilise .get() avec une valeur par défaut pour éviter les KeyErrors si un champ est manquant
        # Ne met à jour que si la clé est présente dans les données reçues
        if 'pseudo' in data:
             gamer.pseudo = data['pseudo']
        if 'level' in data:
             gamer.level = data['level']
        if 'points' in data:
             gamer.points = data['points']
        # Gère l'avatar si envoyé (peut nécessiter un traitement différent pour les fichiers)
        # Si l'avatar est envoyé comme URL, tu peux le stocker directement
        # if 'avatar' in data:
        #     gamer.avatar = data['avatar'] # Attention: gérer le stockage de fichiers est plus complexe

        gamer.save() # Sauvegarde le Gamer (pour avoir un ID si c'est une création)

        # --- Gérer les relations GamerGame (jeux préférés, heures jouées, niveau) ---
        games_data = data.get('games', [])

        # Optionnel: Supprime les relations GamerGame existantes si tu veux les remplacer complètement
        # gamer.gamergame_set.all().delete() # Décommenter si tu veux remplacer

        for game_data in games_data:
            game_name = game_data.get('name')
            skill_level = game_data.get('skill_level')
            hours_played = game_data.get('hours_played')

            if game_name and skill_level is not None and hours_played is not None:
                try:
                    game_obj = Game.objects.get(name=game_name)

                    gamer_game, created = GamerGame.objects.get_or_create(
                        gamer=gamer,
                        game=game_obj,
                        defaults={'skill_level': skill_level, 'hours_played': hours_played}
                    )
                    if not created:
                        gamer_game.skill_level = skill_level
                        gamer_game.hours_played = hours_played
                        gamer_game.save()

                except Game.DoesNotExist:
                    print(f"Jeu '{game_name}' non trouvé dans la base de données Game. Ignoré.")
                    # Tu peux choisir d'ignorer, de créer le jeu, ou de renvoyer une erreur spécifique

        # --- Gérer le jeu favori (si envoyé séparément) ---
        favorite_game_name = data.get('favoriteGameName')
        if favorite_game_name is not None: # Vérifie si la clé est présente, même si la valeur est None
            if favorite_game_name: # Si le nom n'est pas vide
                try:
                    favorite_game_obj = Game.objects.get(name=favorite_game_name)
                    gamer.favoriteGame = favorite_game_obj
                except Game.DoesNotExist:
                    gamer.favoriteGame = None # Si le jeu favori n'existe pas, le champ est mis à None
                    print(f"Jeu favori '{favorite_game_name}' non trouvé dans la base de données Game.")
            else: # Si favoriteGameName est vide ou None
                 gamer.favoriteGame = None
            gamer.save() # Sauvegarde après avoir potentiellement modifié favoriteGame


        status_code = 201 if is_new else 200
        return JsonResponse({'id': gamer.id, 'pseudo': gamer.pseudo, 'detail': 'Gamer profile saved successfully.'}, status=status_code)

    except Exception as e:
        print(f"Erreur dans gamer_create_update_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)


# Exemple de vue pour la liste des gamers (classement)
# Cette vue est appelée par la page de classement.
# Elle ne nécessite pas forcément d'authentification si le classement est public.
# Si tu veux qu'elle soit protégée, ajoute @auth0_required au-dessus de la fonction.
def gamer_list_view(request):
    """
    Récupère et renvoie la liste de tous les profils Gamer pour le classement.
    """
    try:
        gamers = Gamer.objects.all().order_by('-points')
        # Utilise la fonction de sérialisation pour chaque gamer
        gamers_data = [serialize_gamer(gamer, request) for gamer in gamers]

        return JsonResponse(gamers_data, safe=False)
    except Exception as e:
        print(f"Erreur dans gamer_list_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Optionnel: Exemple de vue pour un profil gamer spécifique par ID
# def gamer_detail_view(request, pk):
#     pass # À implémenter

# Optionnel: Exemple de vue pour un profil gamer spécifique par pseudo
# def gamer_detail_view_by_pseudo(request, pseudo):
#     pass # À implémenter