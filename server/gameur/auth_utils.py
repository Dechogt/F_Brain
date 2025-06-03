import jwt
import requests
from django.conf import settings
from django.http import JsonResponse
from functools import wraps
from django.contrib.auth import get_user_model

# Cache pour les clés JWKS
_jwks_client = None

def get_jwks_client():
    """
    Récupère ou crée un client pour télécharger les clés JWKS.
    """
    global _jwks_client
    if _jwks_client is None:
        # Utilise requests pour télécharger les clés JWKS depuis l'URL Auth0
        response = requests.get(settings.AUTH0_JWKS_URL)
        response.raise_for_status() # Lève une exception pour les erreurs HTTP
        _jwks_client = jwt.PyJWKClient(settings.AUTH0_JWKS_URL)
    return _jwks_client

def validate_auth0_token(request):
    """
    Valide le token Auth0 de la requête et attache l'utilisateur Django.
    Retourne l'utilisateur Django s'il est valide, None sinon.
    """
    auth_header = request.headers.get('Authorization')

    if not auth_header:
        return None # Pas de header Authorization

    parts = auth_header.split()

    if parts[0].lower() != 'bearer':
        return None # Le header ne commence pas par 'Bearer'
    elif len(parts) == 1:
        return None # Pas de token après 'Bearer'
    elif len(parts) > 2:
        return None # Header mal formé

    token = parts[1] # Le token JWT

    try:
        # Récupère le client JWKS
        jwks_client = get_jwks_client()

        # Récupère la clé de signature correcte pour ce token
        signing_key = jwks_client.get_signing_key_from_jwt(token).get_secret_value()

        # Décode et valide le token
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"], # L'algorithme utilisé par Auth0
            audience=settings.AUTH0_API_AUDIENCE, # Vérifie l'audience
            issuer=f'https://{settings.AUTH0_DOMAIN}/', # Vérifie l'émetteur
            options={"verify_signature": True, "verify_exp": True} # Vérifie la signature et l'expiration
        )

        # Le token est valide. Récupère l'identifiant utilisateur Auth0 (sub)
        auth0_user_id = payload.get('sub')

        if not auth0_user_id:
            print("Token valide mais pas de 'sub' claim")
            return None # Le token n'a pas l'identifiant utilisateur attendu

        # Trouve ou crée l'utilisateur Django basé sur l'identifiant Auth0
        # Tu devras peut-être adapter cette partie en fonction de comment tu lies les utilisateurs Auth0 à tes utilisateurs Django
        # Une approche courante est de stocker l'identifiant Auth0 (sub) dans un champ de ton modèle utilisateur Django
        User = get_user_model()
        try:
            # Essaie de trouver l'utilisateur par son identifiant Auth0
            # Assumes que ton modèle utilisateur a un champ 'auth0_id'
            # Si tu utilises le modèle User par défaut, tu devras peut-être le lier différemment
            # ou créer un profil utilisateur séparé lié au User par défaut
            user = User.objects.get(auth0_id=auth0_user_id)
            # Si tu utilises le modèle User par défaut et que tu veux le lier par username/email
            # user, created = User.objects.get_or_create(username=auth0_user_id) # Exemple simple, peut nécessiter adaptation
            # Si tu as un profil utilisateur lié au User par défaut
            # profile, created = GamerProfile.objects.get_or_create(auth0_id=auth0_user_id)
            # user = profile.user # Récupère l'utilisateur Django lié
            print(f"Utilisateur Django trouvé: {user.username}")
            request.user = user # Attache l'utilisateur à la requête
            return user

        except User.DoesNotExist:
            # L'utilisateur n'existe pas encore dans ta base de données Django
            # Tu peux choisir de le créer ici ou de renvoyer None
            print(f"Utilisateur Auth0 {auth0_user_id} non trouvé dans Django")
            # Exemple de création simple (peut nécessiter plus de champs)
            # user = User.objects.create_user(username=auth0_user_id, password=None) # Pas de mot de passe si Auth0 gère l'auth
            # user.auth0_id = auth0_user_id
            # user.save()
            # request.user = user
            # return user
            return None # Ou renvoie l'utilisateur créé si tu choisis de le créer

    except jwt.ExpiredSignatureError:
        print("Token expiré")
        return None # Token expiré
    except jwt.InvalidAudienceError:
        print("Audience invalide")
        return None # Audience invalide
    except jwt.InvalidIssuerError:
        print("Émetteur invalide")
        return None # Émetteur invalide
    except Exception as e:
        # Gère les autres erreurs de validation ou de récupération de clé
        print(f"Erreur de validation du token: {e}")
        return None

def auth0_required(view_func):
    """
    Décorateur de vue pour exiger un token Auth0 valide.
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        user = validate_auth0_token(request)

        if user:
            # Le token est valide et l'utilisateur est trouvé/créé
            return view_func(request, *args, **kwargs)
        else:
            # Le token est invalide ou manquant, ou l'utilisateur n'a pas été trouvé/créé
            return JsonResponse({'detail': 'Authentication credentials were not provided or are invalid.'}, status=401)

    return _wrapped_view