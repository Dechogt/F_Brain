
FROM node:alpine

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 5173

# Commande pour démarrer le serveur de développement
CMD ["yarn", "dev", "--host", "0.0.0.0", "--port", "5173"]
