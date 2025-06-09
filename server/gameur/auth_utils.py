import jwt
import requests
from django.conf import settings
from django.http import JsonResponse
from functools import wraps
from django.contrib.auth import get_user_model
from .models import Gamer # Assure-toi que le modèle Gamer est importé

# Cache pour les clés JWKS
_jwks_client = None

def get_jwks_client():
    """
    Récupère ou crée un client pour télécharger les clés JWKS.
    """
    global _jwks_client
    if _jwks_client is None:
        print(f"Téléchargement clés JWKS depuis: {settings.AUTH0_JWKS_URL}")
        try:
            response = requests.get(settings.AUTH0_JWKS_URL)
            response.raise_for_status() # Lève une exception pour les erreurs HTTP
            _jwks_client = jwt.PyJWKClient(settings.AUTH0_JWKS_URL)
            print("Clés JWKS téléchargées et client créé.")
        except Exception as e:
            print(f"Erreur lors du téléchargement des clés JWKS: {e}")
            _jwks_client = None # Assure que le client est None en cas d'erreur
            raise # Relève l'exception pour qu'elle soit gérée plus haut
    return _jwks_client

def validate_auth0_token(request):
    """
    Valide le token Auth0 de la requête et attache l'utilisateur Django.
    Retourne l'utilisateur Django s'il est valide, None sinon.
    """
    print("Début validation token")
    auth_header = request.headers.get('Authorization')
    print("Header Authorization:", auth_header)

    if not auth_header:
        print("Pas de header Authorization")
        return None

    parts = auth_header.split()

    if parts[0].lower() != 'bearer':
        print("Header ne commence pas par 'Bearer'")
        return None
    elif len(parts) == 1:
        print("Pas de token après 'Bearer'")
        return None
    elif len(parts) > 2:
        print("Header mal formé")
        return None

    token = parts[1]
    print("Token extrait:", token)

    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token).get_secret_value()
        print("Clé de signature obtenue.")

        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"], # L'algorithme utilisé par Auth0
            audience=settings.AUTH0_API_AUDIENCE, # Vérifie l'audience
            issuer=f'https://{settings.AUTH0_DOMAIN}/', # Vérifie l'émetteur
            options={"verify_signature": True, "verify_exp": True} # Vérifie la signature et l'expiration
        )
        print("Token validé avec succès. Payload:", payload)

        auth0_user_id = payload.get('sub')
        print("Auth0 User ID (sub):", auth0_user_id)

        if not auth0_user_id:
            print("Token valide mais pas de 'sub' claim")
            return None

        # --- Logique de recherche/création utilisateur Django ---
        User = get_user_model()
        try:
            # Essaie de trouver le Gamer par son auth0_id
            print(f"Recherche Gamer avec auth0_id: {auth0_user_id}")
            gamer = Gamer.objects.get(auth0_id=auth0_user_id)
            user = gamer.user
            print(f"Gamer trouvé: {gamer.pseudo}, Utilisateur Django: {user.username}")
            request.user = user # Attache l'utilisateur Django à la requête
            return user

        except Gamer.DoesNotExist:
            print(f"Gamer avec Auth0 ID {auth0_user_id} non trouvé dans Django.")
            # --- Logique de création automatique si tu la veux ici ---
            # Exemple de création simple (peut nécessiter plus de champs)
            # try:
            #     print("Tentative de création automatique de l'utilisateur Django et Gamer...")
            #     # Crée un utilisateur Django par défaut
            #     user = User.objects.create_user(username=auth0_user_id, password=None)
            #     user.set_unusable_password() # Les utilisateurs Auth0 n'ont pas de mot de passe local
            #     user.save()
            #     # Crée le Gamer lié
            #     gamer = Gamer.objects.create(user=user, auth0_id=auth0_user_id, pseudo=f"gamer_{auth0_user_id[:8]}") # Pseudo temporaire
            #     print(f"Nouveau Gamer créé: {gamer.pseudo}")
            #     request.user = user
            #     return user
            # except Exception as create_error:
            #     print(f"Erreur lors de la création automatique du Gamer: {create_error}")
            #     return None # Échec de la création
            # -------------------------------------------------------
            return None # Si tu ne crées pas automatiquement ici

        except Exception as user_link_error:
            print(f"Erreur lors de la recherche/création de l'utilisateur Django: {user_link_error}")
            return None # Erreur lors de la liaison utilisateur

    except jwt.ExpiredSignatureError:
        print("Token expiré")
        return None
    except jwt.InvalidAudienceError:
        print("Audience invalide")
        return None
    except jwt.InvalidIssuerError:
        print("Émetteur invalide")
        return None
    except Exception as validation_error:
        print(f"Erreur de validation du token: {validation_error}")
        return None

def auth0_required(view_func):
    """
    Décorateur de vue pour exiger un token Auth0 valide.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = validate_auth0_token(request)

        if user:
            print("Validation token réussie, utilisateur attaché.")
            return view_func(request, *args, **kwargs)
        else:
            print("Validation token échouée, renvoi 401.")
            return JsonResponse({'detail': 'Authentication credentials were not provided or are invalid.'}, status=401)

    return _wrapped_view