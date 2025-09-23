import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

// Imports Material pour les dialogues et formulaires
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Participant } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-manage-participants',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manage-participants.component.html',
  styleUrl: './manage-participants.component.scss'
})
export class ManageParticipantsComponent {
  private fb = inject(FormBuilder);
  private boardService = inject(BoardService);
  public dialogRef = inject(MatDialogRef<ManageParticipantsComponent>);
  private notificationService = inject(NotificationService);
  
  // Formulaire pour ajouter un nouveau participant
  addParticipantForm = this.fb.group({
    name: ['', Validators.required]
  });

  // On reçoit les données (l'ID du tableau et la liste des participants) via l'injection
  participants: Participant[] = [];
  isLoading = false;
  isLocalMode: boolean; 

  constructor(@Inject(MAT_DIALOG_DATA) public data: { boardId: number, participants: Participant[] }) {
    this.participants = [...this.data.participants]; // Copie pour éviter la mutation directe
    this.isLocalMode = this.data.boardId === 0;
  }

  onAddParticipant(): void {
    if (this.addParticipantForm.invalid) return;

    this.isLoading = true;
    const newName = this.addParticipantForm.value.name!;
    
    if (this.isLocalMode) {
      // --- LOGIQUE LOCALE ---
      const newParticipant: Participant = {
        id: Date.now(), // ID temporaire unique
        name: newName,
        totalScore: 0,
        scores: []
      };
      this.participants.push(newParticipant);
      this.addParticipantForm.reset();
      this.isLoading = false;
    } else {
      this.boardService.addParticipant(this.data.boardId, newName).subscribe(newParticipant => {
        this.participants.push(newParticipant);
        this.addParticipantForm.reset();
        this.isLoading = false;
        this.notificationService.showSuccess(`"${newName}" a été ajouté.`);
      });
    }
  }

  onRemoveParticipant(participantId: number): void {
    if (this.isLocalMode) {
      // --- LOGIQUE LOCALE ---
      this.participants = this.participants.filter(p => p.id !== participantId);
    } else {
      const participantName = this.participants.find(p => p.id === participantId)?.name;
      this.boardService.removeParticipant(this.data.boardId, participantId).subscribe(() => {
        // Mettre à jour la liste en filtrant le participant supprimé
        this.participants = this.participants.filter(p => p.id !== participantId);
        if (participantName) {
          this.notificationService.showSuccess(`"${participantName}" a été supprimé.`);
        }
      });
    }
  }

  closeDialog(): void {
    const result = this.isLocalMode ? this.participants : true; // Simplification : on peut toujours retourner true si besoin de rafraîchir
    this.dialogRef.close(result);
  }
}