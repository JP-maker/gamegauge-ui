import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BoardService } from '../../services/board.service';
import { LocalStorageService } from '../../services/local-storage.service';

// Imports Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'; // Pour l'indicateur de chargement


// Notre service
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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
  // Injection de dépendances
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private boardService = inject(BoardService);
  private localStorageService = inject(LocalStorageService);

  // Définition du formulaire
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  // Variables pour gérer l'état de la soumission
  isLoading = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    // Ne rien faire si le formulaire est invalide
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.notificationService.showSuccess('Connexion réussie ! Bienvenue.');
        this.handleLocalBoardImport();
        // Rediriger vers la page des tableaux de bord (que nous créerons plus tard)
        this.router.navigate(['/boards']);
      },
      error: (err) => {
        this.isLoading = false;
        // Afficher un message d'erreur clair à l'utilisateur
        this.notificationService.showError('L\'email ou le mot de passe est incorrect.');
        console.error('Erreur de connexion', err);
      }
    });
  }

  private handleLocalBoardImport(): void {
    const guestBoard = this.localStorageService.getGuestBoard();

    if (guestBoard) {
      // Si un jeu local existe, on l'importe
      this.notificationService.showSuccess('Connexion réussie ! Importation de votre partie locale...');
      this.boardService.importBoard(guestBoard).subscribe({
        next: (importedBoard) => {
          this.localStorageService.clearGuestBoard(); // Nettoyer le stockage local
          this.notificationService.showSuccess('Partie importée avec succès !');
          this.router.navigate(['/boards', importedBoard.id]); // Rediriger vers le nouveau tableau
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.showError('Erreur lors de l\'importation de la partie locale.');
          this.router.navigate(['/boards']); // Rediriger quand même vers la liste
        }
      });
    } else {
      // Si pas de jeu local, on redirige normalement
      this.notificationService.showSuccess('Connexion réussie ! Bienvenue.');
      this.router.navigate(['/boards']);
    }
  }
}