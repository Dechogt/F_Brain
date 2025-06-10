# 🎮 Gaming Followers - La Plateforme Ultime pour les Gamers Compétitifs ! 🚀

Bienvenue dans le dépôt de **Gaming Followers**, votre nouvelle maison pour suivre, comparer et célébrer les meilleurs moments et les meilleurs joueurs de vos jeux préférés ! Que vous soyez un pro de l'esport ou un passionné qui aime grimper dans les classements, Gaming Followers est là pour vous.

## ✨ À Propos du Projet

Gaming Followers est une plateforme web conçue pour les gamers compétitifs. Notre objectif est de fournir un espace centralisé où vous pouvez :

*   📊 **Suivre votre progression** dans différents jeux.
*   🏆 **Comparer vos statistiques** et votre classement avec d'autres joueurs.
*   🎮 **Découvrir de nouveaux jeux** et les joueurs qui y excellent.
*   🤝 **Interagir avec la communauté** et trouver d'autres joueurs avec qui faire équipe.

Ce projet est développé en utilisant des technologies modernes pour offrir une expérience rapide, réactive et agréable :

*   **Frontend :** React avec Vite, Yarn, Material UI (pour un design stylé !), Framer Motion (pour des animations fluides !), Auth0 (pour une authentification sécurisée !).
*   **Backend :** Django (sans DRF, pour une approche personnalisée !), PostgreSQL (pour une base de données robuste !).
*   **Infrastructure :** Docker Compose (pour un environnement de développement cohérent !), Nginx (comme proxy inverse !), Celery & RabbitMQ (pour les tâches asynchrones !), Prometheus & Grafana (pour le monitoring !).
*   **CI/CD :** GitHub Actions (pour automatiser les tests et les déploiements !).

## 🛠️ Technologies Utilisées

*   **Frontend :** `React`, `Vite`, `Yarn`, `Material UI`, `Framer Motion`, `Auth0`
*   **Backend :** `Django`, `PostgreSQL`, `Psycopg2`, `PyJWT`, `Requests`
*   **Conteneurisation :** `Docker`, `Docker Compose`
*   **Proxy :** `Nginx`
*   **Tâches Asynchrones :** `Celery`, `RabbitMQ`
*   **Monitoring :** `Prometheus`, `Grafana`
*   **CI/CD :** `GitHub Actions`

## 🚀 Démarrage Rapide (pour les Développeurs)

Pour lancer le projet en local avec Docker Compose :

1.  **Clonez le dépôt :**
    ```bash
    git clone https://github.com/Dechogt/F_Brain.git # Remplacez par l'URL de votre dépôt
    cd F_Brain
    ```
2.  **Configurez vos variables d'environnement :**
    *   Créez un fichier `.env` à la racine du projet.
    *   Créez un fichier `./backend/.env` dans le répertoire `backend`.
    *   Créez un fichier `./frontend/.env` dans le répertoire `frontend`.
    *   Remplissez ces fichiers avec les configurations nécessaires (DB, Django Secret Key, Auth0, etc.). Référez-vous aux exemples de fichiers `.env` si disponibles ou à la documentation interne.

    Exemple de structure `.env` (à la racine) :
    ```dotenv
    # Variables partagées ou générales
    ```
    Exemple de `./backend/.env` :
    ```dotenv
    POSTGRES_DB=gaming_followers_db
    POSTGRES_USER=gaming_user
    POSTGRES_PASSWORD=supersecretpassword
    POSTGRES_HOST=db
    POSTGRES_PORT=5432
    SECRET_KEY=votre_cle_secrete_django_securisee
    AUTH0_DOMAIN=votre-domaine-auth0.auth0.com
    AUTH0_API_AUDIENCE=votre-identifiant-api-auth0
    # ... autres variables backend ...
    ```
    Exemple de `./frontend/.env` :
    ```dotenv
    VITE_AUTH0_DOMAIN=votre-domaine-auth0.auth0.com
    VITE_AUTH0_CLIENT_ID=votre-client-id-frontend
    VITE_AUTH0_AUDIENCE=votre-identifiant-api-auth0
    VITE_AUTH0_SCOPE="openid profile email read:user read:profile" # Ajustez les scopes
    VITE_API_BASE_URL=http://localhost # Ou l'URL de votre API si différente
    VITE_AUTH0_NAMESPACE=votre_namespace_auth0 # Si vous utilisez des rôles/permissions personnalisés
    ```

3.  **Construisez et lancez les conteneurs :**
    ```bash
    docker compose up --build -d
    ```
    Cela construira les images Docker et démarrera tous les services en arrière-plan.

4.  **Appliquez les migrations Django :**
    ```bash
    docker compose exec web python manage.py migrate
    ```
    (Utilisez `web` si c'est le nom de votre service backend dans `docker-compose.yml`).

5.  **Créez un superutilisateur Django (optionnel, pour accéder à l'admin) :**
    ```bash
    docker compose exec web python manage.py createsuperuser
    ```

6.  **Accédez à l'application :**
    *   Le frontend devrait être accessible via Nginx à l'adresse `http://localhost/` (ou le port que vous avez configuré dans `docker-compose.yml` pour Nginx).
    *   L'interface d'administration Django devrait être accessible à `http://localhost/admin/`.

## 📂 Structure du Projet

Le projet est organisé en plusieurs répertoires principaux :

*   `./backend/` : Contient le projet Django.
    *   `./backend/server_config/` : Configuration principale de Django (`settings.py`, `urls.py`).
    *   `./backend/gameur/` : Application Django pour la gestion des gamers, jeux, profils (`models.py`, `views.py`, `urls.py`, `auth_utils.py`).
*   `./frontend/` : Contient l'application React/Vite.
    *   `./frontend/src/` : Code source de l'application React.
        *   `./frontend/src/components/` : Composants réutilisables.
        *   `./frontend/src/pages/` : Composants de page.
        *   `./frontend/src/hooks/` : Hooks personnalisés.
        *   `./frontend/src/contexts/` : Contextes React.
        *   `./frontend/src/styles/` : Styles et thème Material UI.
*   `./nginx/` : Configuration Nginx.
*   `./docker/` : Fichiers de configuration Docker spécifiques (si nécessaire).
*   `./.github/workflows/` : Workflows GitHub Actions pour CI/CD.
*   `./docker-compose.yml` : Configuration principale de Docker Compose.
*   `./.env` : Fichier pour les variables d'environnement (à ne pas committer !).

## 🤝 Contribuer

Nous accueillons les contributions ! Si vous souhaitez contribuer, veuillez suivre ces étapes :

1.  Forkez le dépôt.
2.  Créez une nouvelle branche pour votre fonctionnalité ou correction de bug.
3.  Effectuez vos modifications et testez-les soigneusement.
4.  Soumettez une Pull Request décrivant vos changements.

## 📄 Licence

Ce projet a été realisé en vue d'une soutenance de la technologie DevOps

---

N'hésitez pas à ajuster ce README pour qu'il corresponde parfaitement à votre projet et à votre style ! Ajoutez des sections si nécessaire (par exemple, comment exécuter les tests, comment configurer Auth0 plus en détail, etc.).