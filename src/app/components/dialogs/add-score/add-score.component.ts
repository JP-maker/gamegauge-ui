import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { BoardService } from '../../../services/board.service';

// Imports Material
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
  // Déclarer le formulaire, mais ne pas l'initialiser ici
  addScoreForm: FormGroup;

  // Le constructeur est maintenant responsable de TOUTE l'initialisation
  constructor(
    private fb: FormBuilder,
    private boardService: BoardService,
    public dialogRef: MatDialogRef<AddScoreComponent>,
    // @Inject est la manière correcte de recevoir les données dans un dialogue
    @Inject(MAT_DIALOG_DATA) public data: { 
      boardId: number, 
      participantId: number, 
      participantName: string, 
      nextRoundNumber: number 
    }
  ) {
    // Initialiser le formulaire ICI, à l'intérieur du constructeur,
    // où 'this.data' est garanti d'être disponible.
    this.addScoreForm = this.fb.group({
      scoreValue: [0, Validators.required],
      roundNumber: [this.data.nextRoundNumber, [Validators.required, Validators.min(1)]]
    });
  }

  onSave(): void {
    if (this.addScoreForm.invalid) return;

    // Appeler la nouvelle méthode du service
    this.boardService.setScore(this.data.boardId, this.data.participantId, this.addScoreForm.value as any)
      .subscribe(() => {
        this.dialogRef.close(true);
    });
}

  onCancel(): void {
    this.dialogRef.close();
  }
}