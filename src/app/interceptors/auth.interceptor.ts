import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Injecter notre service d'authentification
  const authService = inject(AuthService);
  const authToken = authService.getToken();

  // Si le token n'existe pas, on ne fait rien et on passe à la suite.
  // C'est le cas pour les requêtes de login ou de register.
  if (!authToken) {
    return next(req);
  }

  // Si le token existe, on clone la requête pour y ajouter l'en-tête Authorization.
  // On clone car les requêtes (req) sont immuables.
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authToken}`
    }
  });

  // On passe la nouvelle requête (avec l'en-tête) au prochain maillon de la chaîne.
  return next(authReq);
};