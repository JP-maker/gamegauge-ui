import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur est déjà connecté...
  if (authService.isLoggedIn()) {
    // ... on le redirige vers sa page principale (/boards) et on bloque l'accès.
    router.navigate(['/boards']);
    return false;
  }

  // Sinon (s'il n'est pas connecté), on l'autorise à accéder à la page publique.
  return true;
};