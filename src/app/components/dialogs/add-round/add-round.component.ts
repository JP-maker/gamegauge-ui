// Fichier : src/app/components/dialogs/add-round/add-round.component.ts

import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Participant } from '../../../models/board.model';
import { playerColorClass, playerInitials } from '../../../utils/player-color.utils';

/** Une ligne du formulaire, renvoyée au composant parent. */
export interface RoundScore {
  participantId: number;
  scoreValue: number;
}

/** Ce que le dialogue renvoie à sa fermeture. */
export interface RoundResult {
  roundNumber: number;
  scores: RoundScore[];
}

/**
 * Saisie d'une manche entière : un champ par joueur, dans une seule fenêtre.
 *
 * C'est le geste réel autour d'une table — on compte les points de tous les
 * joueurs à la fin d'une manche, puis on les reporte. Le jeton de chaque
 * joueur reste utile pour corriger un score isolé.
 *
 * Changer le numéro de manche recharge les valeurs déjà enregistrées pour
 * cette manche : la même fenêtre sert donc à saisir et à corriger. C'est sans
 * risque, l'API met à jour la manche existante au lieu d'en créer une
 * seconde.
 */
@Component({
  selector: 'app-add-round',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './add-round.component.html',
  styleUrl: './add-round.component.scss',
})
export class AddRoundComponent {
  roundForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AddRoundComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { participants: Participant[]; nextRoundNumber: number }
  ) {
    this.roundForm = this.fb.group({
      roundNumber: [
        this.data.nextRoundNumber,
        [Validators.required, Validators.min(1)],
      ],
      scores: this.fb.array(
        this.data.participants.map(participant =>
          this.fb.group({
            participantId: [participant.id],
            // Pas de Validators.required ici : vider le champ est un geste
            // naturel pour « ce joueur n'a rien marqué », et bloquer
            // l'enregistrement sans l'expliquer serait déroutant. Un champ
            // vide est normalisé à zéro à la sortie.
            scoreValue: [0 as number | string],
          })
        )
      ),
    });

    // Si l'utilisateur revient sur une manche déjà jouée, on affiche ses
    // valeurs plutôt que des zéros, pour qu'il corrige au lieu d'écraser.
    this.roundForm.get('roundNumber')!.valueChanges.subscribe(round => {
      this.fillFromExistingRound(Number(round));
    });
  }

  get scores(): FormArray {
    return this.roundForm.get('scores') as FormArray;
  }

  /** Le joueur correspondant à une ligne du formulaire. */
  participantAt(index: number): Participant {
    return this.data.participants[index];
  }

  colorOf(index: number): string {
    return playerColorClass(index);
  }

  initialsOf(index: number): string {
    return playerInitials(this.data.participants[index]?.name);
  }

  private fillFromExistingRound(round: number): void {
    this.data.participants.forEach((participant, index) => {
      const existing = (participant.scores || [])
        .find(score => score.roundNumber === round);

      this.scores
        .at(index)
        .get('scoreValue')!
        .setValue(existing ? existing.scoreValue : 0, { emitEvent: false });
    });
  }

  onSave(): void {
    if (this.roundForm.invalid) {
      return;
    }

    const raw = this.roundForm.value as {
      roundNumber: number | string;
      scores: { participantId: number; scoreValue: number | string }[];
    };

    const result: RoundResult = {
      roundNumber: Number(raw.roundNumber),
      // Les champs numériques d'un formulaire renvoient des chaînes dès que
      // l'utilisateur les édite : on normalise avant de sortir du dialogue.
      scores: raw.scores.map(score => ({
        participantId: score.participantId,
        scoreValue: Number(score.scoreValue) || 0,
      })),
    };

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
