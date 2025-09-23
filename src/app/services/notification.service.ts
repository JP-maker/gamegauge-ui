import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  /**
   * Affiche une notification de succès (verte).
   * @param message Le message à afficher.
   */
  showSuccess(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000, // La notification disparaît après 3 secondes
      panelClass: ['snackbar-success'] // Classe CSS pour le style vert
    });
  }

  /**
   * Affiche une notification d'erreur (rouge).
   * @param message Le message à afficher.
   */
  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000, // On laisse plus de temps pour lire les erreurs
      panelClass: ['snackbar-error'] // Classe CSS pour le style rouge
    });
  }
}