# Étape 1 : Build Angular
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

# Étape 2 : Serveur Nginx
FROM nginx:alpine
# Copie de la config Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copie des fichiers compilés (vérifiez que le dossier dans dist s'appelle bien gamegauge-ui ou browser)
COPY --from=build /app/dist/gamegauge-ui/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]