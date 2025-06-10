import jwt
import requests
from django.http import JsonResponse
from functools import wraps
from django.contrib.auth import get_user_model
from django.conf import settings
from django.db import transaction # Pour gérer les transactions si tu crées des utilisateurs/gamers

# Assure-toi d'importer ton modèle Gamer si tu le lies directement à l'utilisateur Auth0 ID
from .models import Gamer # Assumes Gamer model exists

User = get_user_model()

# Cache pour les clés JWKS pour éviter de les télécharger à chaque requête
# En production, utilise un cache plus robuste (comme celui de Django)
_cached_jwks = None

def get_jwks(domain):
    """
    Récupère les clés publiques JWKS d'Auth0.
    """
    global _cached_jwks
    if _cached_jwks:
        return _cached_jwks

    jwks_url = f'https://{domain}/.well-known/jwks.json'
    try:
        response = requests.get(jwks_url, timeout=5) # Ajoute un timeout
        response.raise_for_status() # Lève une exception pour les codes d'erreur HTTP
        _cached_jwks = response.json()
        return _cached_jwks
    except requests.exceptions.RequestException as e:
        print(f"Erreur lors de la récupération des JWKS: {e}")
        return None # Retourne None en cas d'erreur

def validate_auth0_token(token):
    """
    Valide un token JWT Auth0.
    Retourne le payload du token si valide, None sinon.
    """
    domain = settings.AUTH0_DOMAIN
    audience = settings.AUTH0_API_AUDIENCE

    if not domain or not audience:
        print("Configuration Auth0 (DOMAIN ou AUDIENCE) manquante dans les settings.")
        return None

    jwks = get_jwks(domain)
    if not jwks:
        print("Impossible de récupérer les clés JWKS.")
        return None

    try:
        # Décode et valide le token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"], # L'algorithme par défaut d'Auth0 pour les tokens d'accès
            audience=audience,
            issuer=f'https://{domain}/'
        )
        # Optionnel: Vérifier d'autres claims si nécessaire (permissions, etc.)
        return payload
    except jwt.ExpiredSignatureError:
        print("Token expiré.")
        return None
    except jwt.InvalidAudienceError:
        print("Audience invalide.")
        return None
    except jwt.InvalidIssuerError:
        print("Émetteur invalide.")
        return None
    except jwt.InvalidTokenError as e:
        print(f"Token invalide: {e}")
        return None
    except Exception as e:
        print(f"Erreur inattendue lors de la validation du token: {e}")
        return None

def auth0_required(view_func):
    """
    Décorateur de vue pour les endpoints API protégés par Auth0.
    Valide le token JWT, trouve ou crée l'utilisateur Django,
    et l'attache à request.user.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # 1. Extraire le token de l'en-tête Authorization
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("Authorization header missing")
            return JsonResponse({'detail': 'Authentication credentials were not provided.'}, status=401)

        try:
            token_type, token = auth_header.split(' ')
            if token_type.lower() != 'bearer':
                 print("Invalid token type")
                 return JsonResponse({'detail': 'Invalid token type. Must be Bearer.'}, status=401)
        except ValueError:
             print("Invalid authorization header format")
             return JsonResponse({'detail': 'Invalid authorization header format. Must be Bearer <token>.'}, status=401)

        # 2. Valider le token
        payload = validate_auth0_token(token)

        if payload is None:
            # validate_auth0_token a déjà loggué la raison spécifique
            print("Token validation failed.")
            return JsonResponse({'detail': 'Invalid or expired token.'}, status=401)

        # 3. Identifier l'utilisateur Django basé sur le payload Auth0
        # Le 'sub' claim est l'identifiant unique de l'utilisateur Auth0
        auth0_user_id = payload.get('sub')
        if not auth0_user_id:
             print("User ID (sub) not found in token payload")
             return JsonResponse({'detail': 'User ID not found in token payload.'}, status=400)

        # 4. Trouver ou créer l'utilisateur Django et le lier au Auth0 ID
        # Utilise une transaction pour s'assurer que la création est atomique
        try:
            with transaction.atomic():
                # Assumes your User model has an 'auth0_id' field (CharField, unique=True)
                # Si tu n'as pas modifié le modèle User par défaut, tu devras peut-être
                # créer un modèle Profile ou Gamer lié par OneToOneField et y stocker l'auth0_id.
                # Pour cet exemple, je suppose que tu as ajouté un champ `auth0_id` au modèle User
                # ou que tu utilises un modèle Profile/Gamer lié.

                # Option A: Ajouter auth0_id au modèle User par défaut (nécessite une migration)
                # user, created = User.objects.get_or_create(auth0_id=auth0_user_id)
                # if created:
                #     # Si l'utilisateur est nouveau, tu peux définir d'autres champs ici
                #     # comme le username ou l'email à partir du payload si disponibles
                #     user.username = payload.get('nickname', auth0_user_id) # Exemple
                #     user.email = payload.get('email', '') # Exemple
                #     user.save()
                #     print(f"Nouvel utilisateur Django créé pour Auth0 ID: {auth0_user_id}")

                # Option B: Utiliser un modèle Gamer lié par OneToOneField à User
                # C'est probablement plus proche de ta structure actuelle si Gamer a un champ 'user'
                # et potentiellement un champ 'auth0_id' pour la recherche initiale.
                # Si Gamer a un OneToOneField vers User, et User a un champ auth0_id:
                # user, user_created = User.objects.get_or_create(auth0_id=auth0_user_id)
                # gamer, gamer_created = Gamer.objects.get_or_create(user=user)
                # if gamer_created:
                #     print(f"Nouveau profil Gamer créé pour utilisateur Auth0 ID: {auth0_user_id}")
                #     # Tu peux initialiser des champs par défaut pour le nouveau Gamer ici

                # Option C: Si ton modèle Gamer stocke directement l'auth0_id et n'est PAS lié à User par défaut
                # (Moins courant, mais possible si tu n'utilises pas le système d'auth de Django pour les sessions)
                # Dans ce cas, tu ne peux pas attacher à request.user. Tu attacherais peut-être à request.gamer_profile
                # gamer, created = Gamer.objects.get_or_create(auth0_id=auth0_user_id)
                # request.gamer_profile = gamer # Attache le profil Gamer à la requête
                # print(f"Profil Gamer trouvé/créé pour Auth0 ID: {auth0_user_id}")


                # **Assumons pour l'instant que tu as un modèle Gamer avec un champ `auth0_id` (unique=True)**
                # **et que tu veux attacher l'objet Gamer à la requête.**
                # **Si tu utilises le modèle User de Django, l'Option B est plus standard.**
                # **Je vais adapter pour l'Option B, car c'est plus courant avec Auth0 et Django.**
                # **Cela nécessite que ton modèle User par défaut ait un champ `auth0_id` ou que tu utilises un modèle User personnalisé.**
                # **Si tu n'as pas modifié le modèle User, dis-le moi, on adaptera.**

                # Option B (recommandée si tu utilises le système d'auth de Django):
                # Nécessite un champ `auth0_id` sur ton modèle User (ou un modèle Profile/Gamer lié)
                # Si tu utilises le modèle User par défaut, tu devras créer un modèle Profile/Gamer
                # avec un OneToOneField vers User et y stocker l'auth0_id.

                # Exemple avec un modèle Gamer lié à User par OneToOneField et User ayant un champ auth0_id
                # (C'est une hypothèse, adapte si ta structure est différente)
                user, user_created = User.objects.get_or_create(auth0_id=auth0_user_id)
                if user_created:
                     # Si l'utilisateur Django est nouveau, tu peux le peupler avec des données Auth0
                     user.username = payload.get('nickname', auth0_user_id) # Utilise nickname si dispo, sinon auth0_id
                     user.email = payload.get('email', '') # Utilise email si dispo
                     user.save()
                     print(f"Nouvel utilisateur Django créé pour Auth0 ID: {auth0_user_id}")

                # Trouve ou crée le profil Gamer lié à cet utilisateur Django
                gamer, gamer_created = Gamer.objects.get_or_create(user=user)
                if gamer_created:
                    print(f"Nouveau profil Gamer créé pour utilisateur Django ID: {user.id}")
                    # Initialise les champs par défaut du Gamer si nécessaire
                    gamer.pseudo = user.username # Exemple: pseudo par défaut = username
                    gamer.save()


                request.user = user # Attache l'utilisateur Django à la requête
                request.gamer_profile = gamer # Optionnel: Attache aussi le profil Gamer pour un accès facile
                request.auth_payload = payload # Optionnel: Attache le payload Auth0

        except Exception as e:
            print(f"Erreur lors de la récupération/création de l'utilisateur/gamer Django: {e}")
            # Renvoie une erreur interne si la base de données ou la logique de création échoue
            return JsonResponse({'detail': 'Internal server error during user processing.'}, status=500)


        # 5. Si l'authentification et l'identification réussissent, appelle la vue originale
        return view_func(request, *args, **kwargs)

    return _wrapped_view

# --- Fonctions utilitaires pour les vues ---

# Fonction pour sérialiser un objet Gamer (peut être réutilisée)
def serialize_gamer(gamer, request):
    """
    Sérialise un objet Gamer en dictionnaire.
    """
    return {
        'id': gamer.id,
        'pseudo': gamer.pseudo,
        'avatar': request.build_absolute_uri(gamer.avatar.url) if gamer.avatar else None,
        'level': gamer.level,
        'points': gamer.points,
        # 'rank': gamer.rank, # Si tu as un champ rank
        'created_at': gamer.created_at.isoformat(),
        'topGames': [game.name for game in gamer.top_games], # Assumes top_games is a property
        'favoriteGame': gamer.favorite_game.name if gamer.favorite_game else None, # Assumes favorite_game is a property
        # Ajoute d'autres champs si nécessaire
    }

# Fonction pour sérialiser un objet Game (peut être réutilisée)
def serialize_game(game):
     """
     Sérialise un objet Game en dictionnaire.
     """
     return {
         'id': game.id,
         'name': game.name,
         # Ajoute d'autres champs du modèle Game si nécessaire
     }