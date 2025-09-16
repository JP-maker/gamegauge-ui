import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur est connecté, on l'autorise à accéder à la page.
  if (authService.isLoggedIn()) {
    return true;
  }

  // Sinon, on le redirige vers la page de connexion et on bloque l'accès.
  router.navigate(['/login']);
  return false;
};