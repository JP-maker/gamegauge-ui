import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthService).getToken();

  // Le jeton ne part que vers notre propre API. Aujourd'hui toutes les requêtes
  // HttpClient y vont, mais il suffirait d'un appel vers un service tiers —
  // une météo, une image distante — pour que l'en-tête Authorization parte avec.
  if (!authToken || !req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  // On clone car les requêtes sont immuables.
  return next(req.clone({
    setHeaders: { Authorization: `Bearer ${authToken}` }
  }));
};
