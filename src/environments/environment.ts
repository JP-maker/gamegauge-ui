
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  // En local la version n'a pas de sens : « dev » suffit à dire qu'on ne
  // regarde pas la production.
  version: 'dev',
  recaptcha: {
    siteKey: '6LddofUrAAAAALgsbiVLoWk58RM3ZDy1uKOnE-Kt' // Remplacez par votre clé publique
  }
};
