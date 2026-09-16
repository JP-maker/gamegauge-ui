# Étape 1 : Build Angular
# Node 22 (LTS) : Node 18 est en fin de vie, et c'est la version
# utilisée par la CI, donc l'image build exactement comme les tests.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
# npm ci : installation reproductible à partir du package-lock.json
RUN npm ci
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