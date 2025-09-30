// Fichier : src/app/components/dialogs/add-score/add-score.component.ts

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Imports pour Angular Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-add-score',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './add-score.component.html',
  styleUrl: './add-score.component.scss'
})
export class AddScoreComponent {
  // Déclaration du formulaire
  addScoreForm: FormGroup;

  /**
   * Le constructeur est responsable de l'injection des dépendances et de
   * l'initialisation du formulaire.
   */
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddScoreComponent>,
    // Injection des données passées par le composant parent (ex: `BoardDetailComponent`)
    // Ces données sont utilisées pour l'affichage et l'initialisation.
    @Inject(MAT_DIALOG_DATA) public data: { 
      participantName: string, 
      nextRoundNumber: number 
    }
  ) {
    // Initialisation du formulaire réactif.
    // On utilise les données injectées pour pré-remplir le numéro du tour.
    this.addScoreForm = this.fb.group({
      scoreValue: [0, Validators.required],
      roundNumber: [this.data.nextRoundNumber, [Validators.required, Validators.min(1)]]
    });
  }

  /**
   * Méthode appelée lors de la soumission du formulaire.
   * Si le formulaire est valide, elle ferme le dialogue en retournant
   * les valeurs du formulaire au composant parent.
   */
  onSave(): void {
    if (this.addScoreForm.valid) {
      // Le dialogue se ferme et passe les données à la méthode `afterClosed()`
      // du composant qui l'a ouvert.
      this.dialogRef.close(this.addScoreForm.value);
    }
  }

  /**
   * Méthode appelée lorsque l'utilisateur clique sur "Annuler".
   * Ferme le dialogue sans retourner de données.
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}