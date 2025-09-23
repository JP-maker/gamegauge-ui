import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, startWith, Subject, switchMap } from 'rxjs';
import { Board, Participant } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';
import { ManageParticipantsComponent } from '../../../components/dialogs/manage-participants/manage-participants.component';
import { tap } from 'rxjs';
import { RoundData } from '../../../models/round.model';
import { Router } from '@angular/router';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AddScoreComponent } from '../../../components/dialogs/add-score/add-score.component';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu'; 
import { ConfirmComponent } from '../../../components/dialogs/confirm/confirm.component';
import { NotificationService } from '../../../services/notification.service';
import { TotalScorePipe } from '../../../pipes/total-score.pipe'; 

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatTableModule,
    MatMenuModule,
    TotalScorePipe
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})

export class BoardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private dialog = inject(MatDialog); // <-- INJECTER MatDialog
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  board$!: Observable<Board>;
  // Ajout pour pouvoir recharger les données
  private refreshBoard$ = new Subject<void>();
  roundsData: RoundData[] = [];
  displayedColumns: string[] = [];
  participantIds: number[] = [];
  participantMap = new Map<number, string>();

  ngOnInit(): void {
    this.board$ = this.route.paramMap.pipe(
      switchMap(params => {
        const boardId = Number(params.get('id'));
        // Utiliser le refreshBoard$ pour re-déclencher la requête
        return this.refreshBoard$.pipe(
          startWith(undefined),
          switchMap(() => this.boardService.getBoardById(boardId)),
          // Utiliser tap pour exécuter du code avec les données reçues
          tap(board => this.processBoardData(board)) // <-- ON TRANSFORME LES DONNÉES ICI
        );
      })
    );
  }

   private processBoardData(board: Board): void {
    if (!board || !board.participants) {
      return;
    }

    // 1. Créer la map des participants pour un accès facile au nom
    this.participantMap.clear();
    this.participantIds = [];
    board.participants.forEach(p => this.participantMap.set(p.id, p.name));

    // 2. Définir les colonnes du tableau Material
    // La première colonne est "Tour", suivie des noms des participants
    this.displayedColumns = ['roundNumber', ...board.participants.map(p => p.id.toString())];
    board.participants.forEach(p => {
      this.participantMap.set(p.id, p.name);
      this.participantIds.push(p.id); // <-- Remplir le tableau
    });

    // 3. Transformer les données
    this.displayedColumns = ['roundNumber', ...board.participants.map(p => p.id.toString())];
    const roundsMap = new Map<number, { [participantId: number]: number | null }>();
    let maxRound = 0;

    board.participants.forEach(p => {
      p.scores.forEach(s => {
        const round = roundsMap.get(s.roundNumber) || {};
        round[p.id] = s.scoreValue;
        roundsMap.set(s.roundNumber, round);
        if (s.roundNumber > maxRound) {
          maxRound = s.roundNumber;
        }
      });
    });
    

    // 4. Convertir la map en tableau trié
    this.roundsData = Array.from({ length: maxRound }, (_, i) => i + 1)
      .map(roundNum => {
        const scoresForRound = roundsMap.get(roundNum) || {};
        // S'assurer que chaque participant a une entrée pour ce tour (même si c'est null)
        board.participants.forEach(p => {
          if (!scoresForRound.hasOwnProperty(p.id)) {
            scoresForRound[p.id] = null;
          }
        });
        return {
          roundNumber: roundNum,
          scores: scoresForRound
        };
      });
  }

   openManageParticipantsDialog(board: Board): void {
    const dialogRef = this.dialog.open(ManageParticipantsComponent, {
      width: '450px',
      data: { boardId: board.id, participants: board.participants }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si le dialogue a renvoyé 'true', cela signifie qu'il y a eu des changements.
      if (result) {
        // On force le rechargement des données du tableau
        this.refreshBoard$.next();
      }
    });
  }
  
  openAddScoreDialog(boardId: number, participant: Participant): void {
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
        // On appelle le service API avec les données retournées
        this.boardService.setScore(boardId, participant.id, result).subscribe(() => {
          this.notificationService.showSuccess(`Score enregistré pour ${participant.name}.`);
          this.refreshBoard$.next();
        });
      }
    });
  }

  onDeleteBoard(boardId: number, boardName: string): void {
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Supprimer le tableau',
        message: `Êtes-vous sûr de vouloir supprimer définitivement le tableau "${boardName}" et tous ses scores ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.boardService.deleteBoard(boardId).subscribe(() => {
          console.log('Tableau supprimé avec succès');
          // Rediriger l'utilisateur vers la liste des tableaux
          this.router.navigate(['/boards']);
        });
      }
    });
  }
  
}