// Fichier : src/environments/environment.ts
//Note : Plus tard, pour la production, vous ferez de même dans `src/environments/environment.prod.ts

export const environment = {
  production: false,
  // AJOUTER CETTE LIGNE
  recaptcha: {
    siteKey: '6LddofUrAAAAALgsbiVLoWk58RM3ZDy1uKOnE-Kt' // Remplacez par votre clé publique
  }
};
