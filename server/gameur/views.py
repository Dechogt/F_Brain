
from django.http import JsonResponse
from .auth_utils import auth0_required
# from .models import GamerProfile # <-- Supprime ou commente cette ligne
from .models import Gamer, Game, GamerGame # <-- Importe tes modèles avec les bons noms
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model # Pour accéder au modèle User
import json # Pour parser le corps de la requête JSON
from django.views.decorators.csrf import csrf_exempt

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
# @csrf_exempt # Utilise ceci si tu ne gères pas le CSRF sur cet endpoint
def gamer_create_update_view(request):
    if request.method not in ['POST', 'PUT']:
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

    try:
        data = json.loads(request.body)

        # Récupère le Gamer lié à l'utilisateur authentifié
        try:
            gamer = Gamer.objects.get(user=request.user)
            is_new = False
        except Gamer.DoesNotExist:
            # Si le Gamer n'existe pas, crée-le.
            # Assure-toi que request.user a bien l'attribut auth0_id
            # ou que tu peux le récupérer d'une autre manière après validation Auth0
            auth0_id = request.user.auth0_id # Assumes auth0_id est sur le modèle User ou Gamer
            if not auth0_id:
                 # Gérer le cas où l'auth0_id n'est pas disponible
                 return JsonResponse({'detail': 'Auth0 ID not available for user.'}, status=400)

            # Crée l'utilisateur Django si nécessaire (si pas fait dans auth_utils)
            # user, created = User.objects.get_or_create(username=auth0_id) # Exemple si tu lies par username
            # if created:
            #     user.set_unusable_password() # Les utilisateurs Auth0 n'ont pas de mot de passe local
            #     user.save()

            gamer = Gamer(user=request.user, auth0_id=auth0_id)
            is_new = True

        # Met à jour les champs du Gamer
        gamer.pseudo = data.get('pseudo', gamer.pseudo)
        gamer.level = data.get('level', gamer.level)
        gamer.points = data.get('points', gamer.points)
        # Gère l'avatar si envoyé (peut nécessiter un traitement différent pour les fichiers)
        # Si l'avatar est envoyé comme URL, tu peux le stocker directement
        # gamer.avatar = data.get('avatar', gamer.avatar)

        gamer.save() # Sauvegarde le Gamer

        # --- Gérer les relations GamerGame (jeux préférés, heures jouées, niveau) ---
        # Assumes que les données des jeux sont envoyées dans un format comme :
        # { "pseudo": "...", "games": [ {"name": "Valorant", "skill_level": 4, "hours_played": 300}, ... ] }
        games_data = data.get('games', [])
        # Supprime les relations GamerGame existantes si tu veux les remplacer complètement
        # gamer.gamergame_set.all().delete()

        for game_data in games_data:
            game_name = game_data.get('name')
            skill_level = game_data.get('skill_level')
            hours_played = game_data.get('hours_played')

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
                    print(f"Jeu '{game_name}' non trouvé dans la base de données Game.")
                    # Tu peux choisir d'ignorer, de créer le jeu, ou de renvoyer une erreur

        # --- Gérer le jeu favori (si envoyé séparément) ---
        # Assumes data['favoriteGameName'] est le nom du jeu favori
        # favorite_game_name = data.get('favoriteGameName')
        # if favorite_game_name:
        #     try:
        #         favorite_game_obj = Game.objects.get(name=favorite_game_name)
        #         gamer.favoriteGame = favorite_game_obj
        #         gamer.save() # Sauvegarde à nouveau si tu modifies favoriteGame après la première save
        #     except Game.DoesNotExist:
        #         gamer.favoriteGame = None # Ou gérer l'erreur
        # else:
        #     gamer.favoriteGame = None # Si aucun jeu favori n'est envoyé
        #     gamer.save()


        status_code = 201 if is_new else 200
        return JsonResponse({'id': gamer.id, 'pseudo': gamer.pseudo, 'detail': 'Gamer profile saved successfully.'}, status=status_code)

    except json.JSONDecodeError:
        return JsonResponse({'detail': 'Invalid JSON.'}, status=400)
    except Exception as e:
        print(f"Erreur dans gamer_create_update_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)