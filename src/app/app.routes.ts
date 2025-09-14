import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component'; // <-- NOUVEL IMPORT

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, // <-- NOUVELLE ROUTE
  
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];