export const environment = {
  production: true,
  apiUrl: '/api',
  // Remplacé au moment du build par la CI (étape « Estampiller la version »).
  // Si vous voyez ce texte en production, c'est que l'étape n'a pas tourné.
  version: 'VERSION_AU_BUILD',
  recaptcha: {
    siteKey: '6LddofUrAAAAALgsbiVLoWk58RM3ZDy1uKOnE-Kt' // Remplacez par votre clé publique
  }
};
