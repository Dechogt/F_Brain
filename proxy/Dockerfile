# FROM nginx:alpine
# COPY default.conf /etc/nginx/conf.d/default.conf

FROM nginx:alpine

# Supprimer la configuration par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration personnalisée
COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

# Exposer les ports
EXPOSE 80

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]