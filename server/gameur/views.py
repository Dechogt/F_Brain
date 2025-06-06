
from django.http import JsonResponse
from .auth_utils import auth0_required # Assure-toi que ce fichier existe et est correct
from .models import Gamer, Game, GamerGame # Importe tes modèles
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
import json
from django.views.decorators.csrf import csrf_exempt # Si tu l'utilises pour gamer_create_update_view

User = get_user_model()

# Exemple de vue pour récupérer le profil de l'utilisateur connecté
@auth0_required
def user_profile_view(request):
    """
    Récupère et renvoie les données du profil Gamer de l'utilisateur authentifié.
    """
    try:
        # request.user est l'utilisateur Django attaché par @auth0_required
        # Récupère le Gamer lié à cet utilisateur
        gamer = Gamer.objects.get(user=request.user)
        # Sérialise les données du Gamer
        gamer_data = {
            'id': gamer.id,
            'pseudo': gamer.pseudo,
            # Utilise request.build_absolute_uri pour obtenir l'URL complète de l'avatar
            'avatar': request.build_absolute_uri(gamer.avatar.url) if gamer.avatar else None,
            'level': gamer.level,
            'points': gamer.points,
            # 'rank': gamer.rank, # Si tu as un champ rank
            'created_at': gamer.created_at.isoformat(), # Sérialise la date au format ISO 8601
            # Utilise les propriétés @property pour les jeux
            'topGames': [game.name for game in gamer.top_games], # Accède à la propriété top_games
            'favoriteGame': gamer.favorite_game.name if gamer.favorite_game else None, # Accède à la propriété favorite_game
            # Adapte selon les champs de ton modèle Gamer
        }
        return JsonResponse(gamer_data)
    except Gamer.DoesNotExist:
        # Si l'utilisateur authentifié n'a pas encore de profil Gamer
        return JsonResponse({'detail': 'Gamer profile not found for this user.'}, status=404)
    except Exception as e:
        # Gère les autres erreurs inattendues
        print(f"Erreur dans user_profile_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Exemple de vue pour créer/mettre à jour le profil gamer
@auth0_required
# @csrf_exempt # Décommenter si tu ne gères pas le CSRF sur cet endpoint
def gamer_create_update_view(request):
    """
    Crée ou met à jour le profil Gamer de l'utilisateur authentifié.
    """
    if request.method not in ['POST', 'PUT']:
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

    try:
        # Assure-toi que le corps de la requête est bien du JSON
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'detail': 'Invalid JSON.'}, status=400)

        # Récupère le Gamer lié à l'utilisateur authentifié
        try:
            gamer = Gamer.objects.get(user=request.user)
            is_new = False
        except Gamer.DoesNotExist:
            # Si le Gamer n'existe pas, crée-le.
            # Assure-toi que request.user a bien l'attribut auth0_id
            # ou que tu peux le récupérer d'une autre manière après validation Auth0
            # La logique dans auth_utils.py devrait idéalement attacher l'utilisateur Django
            # et potentiellement créer le Gamer si tu choisis cette approche.
            # Si l'utilisateur Django est créé dans auth_utils, son auth0_id devrait y être stocké.
            # Si l'auth0_id n'est pas sur le modèle User par défaut, tu dois le stocker sur le modèle Gamer.
            # Assumes que l'auth0_id est accessible via request.user ou que tu le stockes sur Gamer
            auth0_id = getattr(request.user, 'auth0_id', None) # Essaie d'obtenir auth0_id de request.user
            if not auth0_id:
                 # Si l'auth0_id n'est pas sur request.user, essaie de le trouver sur le Gamer s'il existe
                 # (ce cas ne devrait pas arriver si Gamer.DoesNotExist est levé)
                 # Ou gère l'erreur si l'auth0_id est manquant après authentification
                 return JsonResponse({'detail': 'Auth0 ID not available for user.'}, status=400)

            gamer = Gamer(user=request.user, auth0_id=auth0_id)
            is_new = True

        # Met à jour les champs du Gamer avec les données reçues
        # Utilise .get() avec une valeur par défaut pour éviter les KeyErrors si un champ est manquant
        gamer.pseudo = data.get('pseudo', gamer.pseudo)
        gamer.level = data.get('level', gamer.level)
        gamer.points = data.get('points', gamer.points)
        # Gère l'avatar si envoyé (peut nécessiter un traitement différent pour les fichiers)
        # Si l'avatar est envoyé comme URL, tu peux le stocker directement
        # gamer.avatar = data.get('avatar', gamer.avatar)

        gamer.save() # Sauvegarde le Gamer (pour avoir un ID si c'est une création)

        # --- Gérer les relations GamerGame (jeux préférés, heures jouées, niveau) ---
        # Assumes que les données des jeux sont envoyées dans un format comme :
        # { "pseudo": "...", "games": [ {"name": "Valorant", "skill_level": 4, "hours_played": 300}, ... ] }
        games_data = data.get('games', [])

        # Optionnel: Supprime les relations GamerGame existantes si tu veux les remplacer complètement
        # gamer.gamergame_set.all().delete()

        for game_data in games_data:
            game_name = game_data.get('name')
            skill_level = game_data.get('skill_level')
            hours_played = game_data.get('hours_played')

            # Vérifie que les données essentielles du jeu sont présentes
            if game_name and skill_level is not None and hours_played is not None:
                try:
                    # Trouve l'objet Game correspondant par son nom
                    game_obj = Game.objects.get(name=game_name)

                    # Trouve ou crée la relation GamerGame
                    gamer_game, created = GamerGame.objects.get_or_create(
                        gamer=gamer,
                        game=game_obj,
                        defaults={'skill_level': skill_level, 'hours_played': hours_played}
                    )
                    # Si la relation existait déjà, met à jour les champs
                    if not created:
                        gamer_game.skill_level = skill_level
                        gamer_game.hours_played = hours_played
                        gamer_game.save()

                except Game.DoesNotExist:
                    # Gérer le cas où le jeu n'existe pas dans la base de données Game
                    print(f"Jeu '{game_name}' non trouvé dans la base de données Game. Ignoré.")
                    # Tu peux choisir d'ignorer, de créer le jeu, ou de renvoyer une erreur

        # --- Gérer le jeu favori (si envoyé séparément) ---
        # Assumes data['favoriteGameName'] est le nom du jeu favori
        favorite_game_name = data.get('favoriteGameName')
        if favorite_game_name:
            try:
                favorite_game_obj = Game.objects.get(name=favorite_game_name)
                gamer.favoriteGame = favorite_game_obj
                gamer.save() # Sauvegarde à nouveau si tu modifies favoriteGame après la première save
            except Game.DoesNotExist:
                gamer.favoriteGame = None # Si le jeu favori n'existe pas, le champ est mis à None
                print(f"Jeu favori '{favorite_game_name}' non trouvé dans la base de données Game.")
        else:
            # Si aucun jeu favori n'est envoyé ou si la valeur est None/vide
            gamer.favoriteGame = None
            gamer.save()


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
        # Récupère tous les gamers, triés par points par exemple
        gamers = Gamer.objects.all().order_by('-points')
        # Sérialise la liste des gamers
        gamers_data = []
        for gamer in gamers:
             gamers_data.append({
                'id': gamer.id,
                'pseudo': gamer.pseudo,
                # Utilise request.build_absolute_uri pour obtenir l'URL complète de l'avatar
                'avatar': request.build_absolute_uri(gamer.avatar.url) if gamer.avatar else None,
                'level': gamer.level,
                'points': gamer.points,
                # 'rank': gamer.rank, # Si tu as un champ rank
                # Utilise les propriétés @property pour les jeux
                # Assure-toi que gamer.top_games retourne une liste d'objets Game ou une liste vide
                'topGames': [game.name for game in gamer.top_games],
                # Assure-toi que gamer.favorite_game retourne un objet Game ou None
                'favoriteGame': gamer.favorite_game.name if gamer.favorite_game else None,
                # Adapte selon les champs de ton modèle Gamer
            })
        return JsonResponse(gamers_data, safe=False) # safe=False est nécessaire si tu renvoies une liste de dictionnaires
    except Exception as e:
        # Gère les autres erreurs inattendues
        print(f"Erreur dans gamer_list_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Optionnel: Exemple de vue pour un profil gamer spécifique par ID
# def gamer_detail_view(request, pk):
#     pass # À implémenter

# Optionnel: Exemple de vue pour un profil gamer spécifique par pseudo
# def gamer_detail_view_by_pseudo(request, pseudo):
#     pass # À implémenter