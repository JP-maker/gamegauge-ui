// Fichier : src/app/pages/register/register.component.ts

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
import { MatHint } from '@angular/material/form-field';

// Nos services personnalisés
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatHint
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  // --- Injections ---
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  
  // --- Propriétés ---
  registerForm: FormGroup;
  isLoading = false;
  // Obtenir la clé directement depuis le fichier d'environnement
  private readonly siteKey: string = environment.recaptcha.siteKey;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  /**
   * Crée un Observable qui enveloppe l'appel reCAPTCHA basé sur un callback.
   * @param action L'action reCAPTCHA (ex: 'register_action').
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
    if (this.registerForm.invalid) {
      return;
    }

    this.isLoading = true;

    this.getRecaptchaToken('register_action').pipe(
      switchMap(token => {
        const userData = {
          ...this.registerForm.value,
          recaptchaToken: token
        };
        return this.authService.register(userData);
      })
    ).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.showSuccess('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409 && err.error?.message) {
          this.notificationService.showError(err.error.message);
        } else {
          this.notificationService.showError('Une erreur est survenue lors de l\'inscription.');
        }
        console.error('Erreur d\'inscription', err);
      }
    });
  }
}