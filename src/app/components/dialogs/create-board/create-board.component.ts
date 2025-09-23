import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

// Imports Material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-create-board',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatRadioModule
  ],
  templateUrl: './create-board.component.html',
  styleUrl: './create-board.component.scss'
})

export class CreateBoardComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CreateBoardComponent>);

  createBoardForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    targetScore: [null],
    scoreCondition: ['HIGHEST_WINS', Validators.required], 
    numberOfRounds: [null]
  });

  // La méthode onSave ne fera que fermer le dialogue en passant les données du formulaire.
  // La logique d'appel API sera dans le composant parent.
  onSave(): void {
    if (this.createBoardForm.valid) {
      this.dialogRef.close(this.createBoardForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}