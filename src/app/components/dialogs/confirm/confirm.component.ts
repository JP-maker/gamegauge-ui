import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Imports Material
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Annuler</button>
      <button mat-flat-button color="warn" [mat-dialog-close]="true" cdkFocusInitial>
        Confirmer
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmComponent {
  // On reçoit le titre et le message à afficher via l'injection de données
  constructor(@Inject(MAT_DIALOG_DATA) public data: { title: string; message: string }) {}
}