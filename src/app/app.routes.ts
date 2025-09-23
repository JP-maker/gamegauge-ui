import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component'; // <-- NOUVEL IMPORT
import { authGuard } from './guards/auth.guard';
import { BoardListComponent } from './pages/boards/board-list/board-list.component';
import { BoardDetailComponent } from './pages/boards/board-detail/board-detail.component';
import { LandingComponent } from './pages/landing/landing.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'boards', component: BoardListComponent, canActivate: [authGuard] },
  { path: 'boards/:id', component: BoardDetailComponent, canActivate: [authGuard] },
  
  { path: '', component: LandingComponent }, // <-- NOUVELLE PAGE D'ACCUEIL
  
  { path: '**', redirectTo: '' }
];