#!/bin/bash

echo "🧹 Nettoyage complet du cache..."

# Arrêter Docker Compose
echo "Arrêt des conteneurs..."
docker compose down

# Supprimer les images Docker
echo "Suppression des images Docker..."
docker compose down --rmi all

# Supprimer les volumes (optionnel - attention aux données)
echo "Suppression des volumes Docker..."
docker compose down -v

# Nettoyer le cache Docker
echo "Nettoyage du cache Docker..."
docker system prune -f

# Nettoyer le cache npm/yarn
echo "Nettoyage du cache npm..."
cd client
rm -rf node_modules package-lock.json
npm cache clean --force
cd ..

cd server
rm -rf node_modules package-lock.json
npm cache clean --force
cd ..

# Reconstruire tout
echo "Reconstruction complète..."
docker compose up -d --build --force-recreate

echo "✅ Cache nettoyé et application redémarrée!"