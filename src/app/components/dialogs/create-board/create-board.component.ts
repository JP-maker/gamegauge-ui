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
import { MatSelectModule } from '@angular/material/select';

import {
  CUSTOM_PRESET_ID,
  GAME_PRESETS,
  GamePreset,
  findPreset,
} from '../../../data/game-presets';

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
    MatRadioModule,
    MatSelectModule
  ],
  templateUrl: './create-board.component.html',
  styleUrl: './create-board.component.scss'
})

export class CreateBoardComponent {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<CreateBoardComponent>);

  readonly presets = GAME_PRESETS;
  readonly customPresetId = CUSTOM_PRESET_ID;

  /** Le choix affiché dans le sélecteur. */
  selectedPresetId: string = CUSTOM_PRESET_ID;
  /** Le préréglage réellement appliqué, pour afficher son résumé. */
  activePreset: GamePreset | null = null;

  createBoardForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    targetScore: [null],
    scoreCondition: ['HIGHEST_WINS', Validators.required],
    numberOfRounds: [null]
  });

  constructor() {
    // Dès que l'utilisateur retouche une des valeurs posées par un préréglage,
    // le sélecteur repasse sur « Partie personnalisée » : afficher « Skyjo »
    // au-dessus d'un formulaire qui ne contient plus les règles de Skyjo
    // serait trompeur.
    this.createBoardForm.valueChanges.subscribe(() => {
      if (this.activePreset && !this.matchesPreset(this.activePreset)) {
        this.activePreset = null;
        this.selectedPresetId = CUSTOM_PRESET_ID;
      }
    });
  }

  /**
   * Applique un préréglage au formulaire.
   * `emitEvent: false` est indispensable : sans lui, le patch déclencherait
   * valueChanges et le préréglage s'annulerait lui-même aussitôt.
   */
  onPresetChange(presetId: string): void {
    this.selectedPresetId = presetId;

    const preset = findPreset(presetId);
    this.activePreset = preset;

    if (!preset) {
      return;
    }

    this.createBoardForm.patchValue({
      name: preset.name,
      targetScore: preset.targetScore,
      scoreCondition: preset.scoreCondition,
      numberOfRounds: preset.numberOfRounds
    }, { emitEvent: false });
  }

  /** Le formulaire correspond-il encore au préréglage appliqué ? */
  private matchesPreset(preset: GamePreset): boolean {
    const value = this.createBoardForm.value;

    const asNumber = (v: unknown): number | null =>
      v === null || v === '' || v === undefined ? null : Number(v);

    return value.name === preset.name
      && asNumber(value.targetScore) === preset.targetScore
      && value.scoreCondition === preset.scoreCondition
      && asNumber(value.numberOfRounds) === preset.numberOfRounds;
  }

  // La méthode onSave ne fait que fermer le dialogue en passant les données du
  // formulaire. Le choix du préréglage n'en fait pas partie : il n'a servi
  // qu'à remplir les champs, et l'API n'en a pas besoin.
  onSave(): void {
    if (this.createBoardForm.valid) {
      this.dialogRef.close(this.createBoardForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
