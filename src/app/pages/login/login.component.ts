// Fichier : src/app/pages/login/login.component.ts

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';

// Librairie reCAPTCHA
import { ReCaptchaV3Service } from 'ngx-captcha';

// Fichier d'environnement
import { environment } from '../../../environments/environment';

// Imports pour Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Nos services personnalisés
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { BoardService } from '../../services/board.service';
import { Title } from '@angular/platform-browser'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private boardService = inject(BoardService);
  private localStorageService = inject(LocalStorageService);

  // --- Propriétés ---
  loginForm: FormGroup;
  isLoading = false;
  // Obtenir la clé directement depuis le fichier d'environnement
  private readonly siteKey: string = environment.recaptcha.siteKey;

  constructor(private titleService: Title) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    // Change le nom de l'onglet quand on arrive sur cette page
    this.titleService.setTitle('Connexion - GameGauge');
  }

  /**
   * Crée un Observable qui enveloppe l'appel reCAPTCHA basé sur un callback.
   * @param action L'action reCAPTCHA (ex: 'login_action').
   */
  private getRecaptchaToken(action: string): Observable<string> {
    return new Observable(observer => {
      this.recaptchaV3Service.execute(
        this.siteKey,
        action,
        (token) => {
          observer.next(token);
          observer.complete();
        },
        undefined, // Argument de configuration optionnel
        (error) => {
          observer.error(error);
        }
      );
    });
  }

  /**
   * Méthode appelée lors de la soumission du formulaire.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }
    this.isLoading = true;

    this.getRecaptchaToken('login_action').pipe(
      switchMap(token => {
        const credentials = {
          ...this.loginForm.value,
          recaptchaToken: token
        };
        return this.authService.login(credentials);
      })
    ).subscribe({
      next: () => {
        // La logique d'importation est gérée ici après le succès de la connexion
        this.handleLocalBoardImport();
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401 || err.status === 403) {
          this.notificationService.showError('L\'email, le mot de passe ou la vérification anti-robot est incorrect.');
        } else {
          this.notificationService.showError('Une erreur de connexion est survenue.');
        }
        console.error('Erreur de connexion', err);
      }
    });
  }
  
  /**
   * Gère l'importation d'un tableau local après une connexion réussie.
   */
  private handleLocalBoardImport(): void {
    const guestBoard = this.localStorageService.getGuestBoard();
    if (guestBoard) {
      this.notificationService.showSuccess('Connexion réussie ! Importation de votre partie locale...');
      this.boardService.importBoard(guestBoard).subscribe({
        next: (importedBoard) => {
          this.localStorageService.clearGuestBoard();
          this.notificationService.showSuccess('Partie importée avec succès !');
          this.router.navigate(['/boards', importedBoard.id]);
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError('Erreur lors de l\'importation de la partie locale.');
          this.router.navigate(['/boards']);
        }
      });
    } else {
      this.isLoading = false;
      this.notificationService.showSuccess('Connexion réussie ! Bienvenue.');
      this.router.navigate(['/boards']);
    }
  }
}