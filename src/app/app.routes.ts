import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

/**
 * Toutes les routes sont chargées à la demande (`loadComponent`).
 *
 * Avant, les sept composants de page étaient importés en haut de ce fichier,
 * donc compilés dans le bundle initial : un visiteur qui arrivait sur la page
 * d'accueil téléchargeait aussi l'écran d'inscription, la liste des tableaux
 * et le détail d'une partie, qu'il ne verrait peut-être jamais.
 *
 * Le découpage change aussi la nature du premier chargement : la page
 * d'accueil est le seul écran du parcours anonyme, et c'est le seul qu'on
 * paie désormais à l'ouverture.
 */
export const routes: Routes = [
  // --- ROUTES PUBLIQUES (un utilisateur connecté est redirigé) -------------
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then(m => m.LandingComponent),
    canActivate: [publicGuard],
    title: 'GameGauge — comptez vos points simplement',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
    canActivate: [publicGuard],
    title: 'Connexion — GameGauge',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then(m => m.RegisterComponent),
    canActivate: [publicGuard],
    title: 'Créer un compte — GameGauge',
  },

  // --- ROUTES PRIVÉES ------------------------------------------------------
  {
    path: 'boards',
    loadComponent: () =>
      import('./pages/boards/board-list/board-list.component').then(m => m.BoardListComponent),
    canActivate: [authGuard],
    title: 'Mes parties — GameGauge',
  },
  {
    path: 'boards/:id',
    loadComponent: () =>
      import('./pages/boards/board-detail/board-detail.component').then(m => m.BoardDetailComponent),
    canActivate: [authGuard],
    title: 'Tableau de scores — GameGauge',
  },

  // --- MOT DE PASSE --------------------------------------------------------
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    title: 'Mot de passe oublié — GameGauge',
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
    title: 'Réinitialisation — GameGauge',
  },

  // --- REDIRECTION ---------------------------------------------------------
  // Toute route inconnue revient à l'accueil ; le garde décide ensuite où
  // envoyer réellement le visiteur.
  { path: '**', redirectTo: '' },
];
