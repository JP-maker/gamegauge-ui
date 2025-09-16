import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component'; // <-- NOUVEL IMPORT
import { authGuard } from './guards/auth.guard';
import { BoardListComponent } from './pages/boards/board-list/board-list.component';
import { BoardDetailComponent } from './pages/boards/board-detail/board-detail.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, // <-- NOUVELLE ROUTE
  
  { 
    path: 'boards', 
    component: BoardListComponent,
    canActivate: [authGuard] // <-- ON APPLIQUE LE GUARD ICI
  },

  { 
    path: 'boards/:id', // Le `:id` est un paramètre dynamique
    component: BoardDetailComponent,
    canActivate: [authGuard] 
  },

  { path: '', redirectTo: '/boards', pathMatch: 'full' }, // Rediriger vers /boards par défaut
  { path: '**', redirectTo: '/boards' } // Rediriger les routes inconnues
];