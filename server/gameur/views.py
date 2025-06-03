from django.shortcuts import render
from django.http import JsonResponse
from .models import Gamer, Game, GamerGame
from .auth_utils import auth0_required # Importe le décorateur
from .models import GamerProfile # Importe ton modèle GamerProfile
from django.shortcuts import get_object_or_404

def gamer_list_view(request):
    """Vue pour lister les gamers"""
    if request.method == 'GET':
        gamers = Gamer.objects.all()
        gamers_data = []
        
        for gamer in gamers:
            gamers_data.append({
                'id': gamer.id,
                'pseudo': gamer.pseudo,
                'level': gamer.level,
                'points': gamer.points,
                'created_at': gamer.created_at.isoformat()
            })
        
        return JsonResponse({'gamers': gamers_data})
    
    return JsonResponse({'error': 'Method not allowed'}, status=405)


# Exemple de vue pour récupérer le profil de l'utilisateur connecté
@auth0_required # Applique le décorateur
def user_profile_view(request):
    # Si on arrive ici, request.user est un utilisateur Django valide
    try:
        # Récupère le GamerProfile lié à l'utilisateur authentifié
        profile = GamerProfile.objects.get(user=request.user)
        # Sérialise le profil en dictionnaire pour le renvoyer en JSON
        profile_data = {
            'pseudo': profile.pseudo,
            'avatar': profile.avatar.url if profile.avatar else None, # Gère les champs ImageField
            'level': profile.level,
            'points': profile.points,
            'rank': profile.rank,
            'favoriteGame': profile.favoriteGame.name if profile.favoriteGame else None, # Assumes favoriteGame est une FK vers un modèle Game
            'topGames': list(profile.topGames.values_list('name', flat=True)), # Assumes topGames est une ManyToMany vers Game
            # Adapte selon les champs de ton modèle GamerProfile
        }
        return JsonResponse(profile_data)
    except GamerProfile.DoesNotExist:
        # Si l'utilisateur n'a pas encore de profil gamer
        return JsonResponse({'detail': 'Gamer profile not found.'}, status=404)
    except Exception as e:
        # Gère les autres erreurs
        print(f"Erreur dans user_profile_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)

# Exemple de vue pour créer/mettre à jour le profil gamer
# Cette vue recevra les données du frontend (pseudo, jeux, etc.)
@auth0_required
def gamer_create_update_view(request):
    if request.method == 'POST':
        # Logique pour créer le profil
        pass # À implémenter
    elif request.method == 'PUT':
        # Logique pour mettre à jour le profil
        pass # À implémenter
    else:
        return JsonResponse({'detail': 'Method not allowed.'}, status=405)

# Exemple de vue pour la liste des gamers (classement)
# Ne nécessite pas forcément d'authentification si c'est public
# Si tu veux qu'elle soit protégée, ajoute @auth0_required
def gamer_list_view(request):
    try:
        # Récupère tous les profils gamers, triés par points par exemple
        gamers = GamerProfile.objects.all().order_by('-points')
        # Sérialise la liste des profils
        gamers_data = []
        for gamer in gamers:
             gamers_data.append({
                'id': gamer.id, # Ajoute un ID unique
                'pseudo': gamer.pseudo,
                'avatar': gamer.avatar.url if gamer.avatar else None,
                'level': gamer.level,
                'points': gamer.points,
                'rank': gamer.rank,
                'favoriteGame': gamer.favoriteGame.name if gamer.favoriteGame else None,
                'topGames': list(gamer.topGames.values_list('name', flat=True)),
                # Adapte selon les champs de ton modèle GamerProfile
            })
        return JsonResponse(gamers_data, safe=False) # safe=False si la liste n'est pas un dictionnaire de haut niveau
    except Exception as e:
        print(f"Erreur dans gamer_list_view: {e}")
        return JsonResponse({'detail': 'Internal server error.'}, status=500)