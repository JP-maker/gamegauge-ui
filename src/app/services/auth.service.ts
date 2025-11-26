// Dans src/app/services/auth.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Injection de dépendances moderne avec inject()
  private http = inject(HttpClient);
  private router = inject(Router);

  private apiUrl = environment.apiUrl + '/auth'; 
  /**
   * Envoie une requête de connexion à l'API.
   * Si la connexion réussit, le token est sauvegardé.
   * @param credentials { email, password }
   */
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // L'opérateur `tap` nous permet d'exécuter du code avec la réponse
        // sans modifier la réponse elle-même.
        if (response && response.token) {
          this.saveToken(response.token);
        }
      })
    );
  }

  /**
   * Envoie une requête d'inscription à l'API.
   * @param userData { username, email, password }
   */
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Sauvegarde le token JWT dans le localStorage du navigateur.
   * @param token Le token JWT reçu.
   */
  saveToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Récupère le token JWT depuis le localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Vérifie si un token est présent.
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /**
   * Gère la déconnexion de l'utilisateur.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    // Redirige l'utilisateur vers la page de connexion.
    this.router.navigate(['/login']);
  }
}