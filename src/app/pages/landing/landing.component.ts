// Code complet pour src/app/pages/landing/landing.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board, Participant, ScoreCondition } from '../../models/board.model';
import { LocalStorageService } from '../../services/local-storage.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ManageParticipantsComponent } from '../../components/dialogs/manage-participants/manage-participants.component';
import { AddScoreComponent } from '../../components/dialogs/add-score/add-score.component';
import { MatTableModule } from '@angular/material/table';
import { RoundData } from '../../models/round.model';
import { RouterLink } from '@angular/router';
import { ScoreEntryResponse } from '../../models/score-entry.model';
import { ConfirmComponent } from '../../components/dialogs/confirm/confirm.component';
import { CreateBoardComponent } from '../../components/dialogs/create-board/create-board.component';
import { TotalScorePipe } from '../../pipes/total-score.pipe';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatDialogModule, 
    MatTableModule, 
    TotalScorePipe
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent implements OnInit {
  private localStorageService = inject(LocalStorageService);
  private dialog = inject(MatDialog);

  roundsData: RoundData[] = [];
  displayedColumns: string[] = [];
  participantMap = new Map<number, string>();
  participantIds: number[] = [];
  guestBoard: Board | null = null;
  isNewBoard = false;

  ngOnInit(): void {
    this.loadGuestBoard();
  }

  loadGuestBoard(): void {
    const board = this.localStorageService.getGuestBoard();
    if (board) {
      this.guestBoard = board;
      this.isNewBoard = false;
    } else {
      // Si on doit en créer un, on ne l'assigne pas tout de suite
      this.guestBoard = null;
      this.isNewBoard = true;
    }
    // On ne traite les données que s'il y a un tableau
    if (this.guestBoard) {
      this.processBoardData();
    }
  }

  startQuickPlay(): void {
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '400px',
      // On peut désactiver la fermeture en cliquant en dehors pour forcer un choix
      disableClose: true 
    });

    dialogRef.afterClosed().subscribe(result => {
      // `result` contiendra les données du formulaire (name, targetScore, etc.)
      // ou sera `undefined` si l'utilisateur a cliqué sur "Annuler".
      if (result) {
        // On utilise les données du dialogue pour créer notre tableau local
        this.guestBoard = this.createEmptyBoard(); // Crée la structure de base
        
        // On met à jour avec les données de l'utilisateur
        this.guestBoard.name = result.name;
        this.guestBoard.targetScore = result.targetScore;
        this.guestBoard.scoreCondition = result.scoreCondition;
        this.guestBoard.numberOfRounds = result.numberOfRounds;

        this.isNewBoard = false; // On a maintenant un tableau
        this.saveState(); // Sauvegarde et met à jour la vue
      }
    });
  }

  createEmptyBoard(): Board {
    return {
      id: 0,
      name: 'Ma Partie Rapide',
      participants: [],
      targetScore: null,
      scoreCondition: null,
      numberOfRounds: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerUsername: 'Invité',
      displayOrder: null
    };
  }

  openManageParticipantsDialog(): void {
    // Logique adaptée pour le localStorage
    if (!this.guestBoard) return;
    const dialogRef = this.dialog.open(ManageParticipantsComponent, {
      width: '450px',
      data: { boardId: this.guestBoard.id, participants: this.guestBoard.participants }
    });
    
    dialogRef.afterClosed().subscribe((updatedParticipants: Participant[] | undefined) => {
      // On ne met à jour que si le dialogue a retourné une liste.
      if (updatedParticipants) {
        this.guestBoard!.participants = updatedParticipants;
        this.saveState(); // Sauvegarde et met à jour la vue
      }
    });
  }

  openAddScoreDialog(participant: Participant): void {
    const nextRoundNumber = (participant.scores?.length || 0) + 1;
    const dialogRef = this.dialog.open(AddScoreComponent, {
      width: '350px',
      data: {
        participantName: participant.name,
        nextRoundNumber: nextRoundNumber
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      // `result` contient maintenant { scoreValue: ..., roundNumber: ... }
      if (result) {
        // On cherche si un score pour ce tour existe déjà
        const existingScore = participant.scores.find(s => s.roundNumber === result.roundNumber);

        if (existingScore) {
          // Mise à jour
          existingScore.scoreValue = result.scoreValue;
        } else {
          // Création
          const score: ScoreEntryResponse = {
            id: Date.now(),
            scoreValue: result.scoreValue,
            roundNumber: result.roundNumber
          };
          participant.scores.push(score);
        }
        
        this.saveState(); // On sauvegarde l'état mis à jour dans le localStorage
      }
    });
  }

  /* Supprime les données du tableau invité et réinitialise l'état */
  resetGuestBoard(): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Recommencer la partie',
        message: 'Êtes-vous sûr de vouloir effacer cette partie ? Toutes les données non sauvegardées seront perdues.'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.localStorageService.clearGuestBoard(); // Efface les données du stockage
        this.loadGuestBoard(); // Recharge le composant (ce qui affichera le bouton "Démarrer")
      }
    });
  }

  private saveState(): void {
    if (!this.guestBoard) return;
    this.localStorageService.saveGuestBoard(this.guestBoard);
    this.processBoardData();
  }
  
  private processBoardData(): void {
    if (!this.guestBoard || !this.guestBoard.participants) { return; }
    this.participantMap.clear();
    this.participantIds = [];
    this.guestBoard.participants.forEach(p => {
        this.participantMap.set(p.id, p.name);
        this.participantIds.push(p.id);
    });
    this.displayedColumns = ['roundNumber', ...this.guestBoard.participants.map(p => p.id.toString())];
    const roundsMap = new Map<number, { [participantId: number]: number | null }>();
    let maxRound = 0;
    this.guestBoard.participants.forEach(p => {
        p.scores.forEach(s => {
            const round = roundsMap.get(s.roundNumber) || {};
            round[p.id] = s.scoreValue;
            roundsMap.set(s.roundNumber, round);
            if (s.roundNumber > maxRound) { maxRound = s.roundNumber; }
        });
    });
    this.roundsData = Array.from({ length: maxRound }, (_, i) => i + 1)
        .map(roundNum => {
            const scoresForRound = roundsMap.get(roundNum) || {};
            // S'assurer que chaque participant a une entrée, même si elle est nulle
            if (!this.guestBoard) { // Cette ligne empêche toute erreur si la méthode est appelée par erreur
              return { roundNumber: roundNum, scores: {} };
            }
            this.guestBoard.participants.forEach(p => {
                if (!scoresForRound.hasOwnProperty(p.id)) { scoresForRound[p.id] = null; }
            });
            return { roundNumber: roundNum, scores: scoresForRound };
        });
}
}