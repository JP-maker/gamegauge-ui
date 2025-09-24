import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component'; // <-- NOUVEL IMPORT
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { BoardListComponent } from './pages/boards/board-list/board-list.component';
import { BoardDetailComponent } from './pages/boards/board-detail/board-detail.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  // --- ROUTES PUBLIQUES (protégées par publicGuard) ---
  { 
    path: '', 
    component: LandingComponent,
    canActivate: [publicGuard] // Un utilisateur connecté sera redirigé
  },
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [publicGuard] // Un utilisateur connecté ne peut pas re-voir cette page
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [publicGuard] // Idem
  },

  // --- ROUTES PRIVÉES (protégées par authGuard) ---
  { 
    path: 'boards', 
    component: BoardListComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'boards/:id', 
    component: BoardDetailComponent,
    canActivate: [authGuard] 
  },
  
  // --- REDIRECTION ---
  // Rediriger toute route inconnue vers la page d'accueil par défaut
  // Le garde s'appliquera alors à cette page pour décider où aller.
  { path: '**', redirectTo: '' }
];