// Fichier : src/app/pages/boards/board-detail/board-detail.component.ts

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// Modèles et Utilitaires
import { Board, Participant } from '../../../models/board.model';
import { GameStatus, calculateGameStatus } from '../../../utils/game-status.utils';

// Services
import { BoardService } from '../../../services/board.service';
import { NotificationService } from '../../../services/notification.service';

// Composants de dialogue
import { ManageParticipantsComponent } from '../../../components/dialogs/manage-participants/manage-participants.component';
import { AddScoreComponent } from '../../../components/dialogs/add-score/add-score.component';
import { ConfirmComponent } from '../../../components/dialogs/confirm/confirm.component';

// Composant réutilisable
import { ScoreboardComponent } from '../../../components/scoreboard/scoreboard.component';

// Imports Angular Material
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatMenuModule,
    MatCardModule,
    ScoreboardComponent
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements OnInit {
  // --- Injection de Dépendances ---
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private boardService = inject(BoardService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);

  // --- Observables pour la Vue ---
  // vm$ (ViewModel Observable) est la source de vérité unique pour le template.
  vm$!: Observable<{ board: Board, gameStatus: GameStatus | null } | null>;

  // `BehaviorSubject` est utilisé pour déclencher manuellement le rechargement des données.
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  ngOnInit(): void {
    // La chaîne d'observables qui pilote le composant.
    this.vm$ = this.route.paramMap.pipe(
      // 1. Obtenir l'ID de la route
      switchMap(params => {
        const boardId = Number(params.get('id'));
        if (isNaN(boardId)) {
          // Si l'ID n'est pas un nombre, on gère l'erreur
          console.error("ID de tableau invalide dans l'URL");
          this.router.navigate(['/boards']);
          return of(null); // Retourner un observable vide pour stopper la chaîne
        }
        // 2. Écouter le déclencheur de rechargement
        return this.refreshTrigger$.pipe(
          switchMap(() => this.boardService.getBoardById(boardId).pipe(
            // INTERCEPTER L'ERREUR DE L'APPEL HTTP
            catchError(error => {
              console.error("ERREUR HTTP dans getBoardById :", error);
              this.notificationService.showError("Impossible de charger le tableau.");
              this.router.navigate(['/boards']);
              return of(null); // Retourner un observable qui émet `null` pour continuer la chaîne proprement
            })
          ))
        );
      }),
      // 4. Transformer les données brutes (Board) en un ViewModel complet
      map(board => {
        // Ce `map` est exécuté à chaque fois que l'API renvoie de nouvelles données
        return {
          board: board!,
          gameStatus: calculateGameStatus(board!)
        };
      })
    );
  }

  /**
   * Déclenche le rechargement des données en émettant une nouvelle valeur
   * dans le BehaviorSubject.
   */
  private refreshData(): void {
    this.refreshTrigger$.next();
  }

  // --- Méthodes pour les Actions Utilisateur ---

  openManageParticipantsDialog(board: Board): void {
    const dialogRef = this.dialog.open(ManageParticipantsComponent, {
      width: '450px',
      data: { boardId: board.id, participants: board.participants }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Si le dialogue a renvoyé un résultat (c'est-à-dire qu'il y a eu des changements)
      if (result) {
        this.notificationService.showSuccess('Liste des participants mise à jour.');
        this.refreshData();
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
      if (result) {
        this.boardService.setScore(boardId, participant.id, result).subscribe(() => {
          this.notificationService.showSuccess(`Score enregistré pour ${participant.name}.`);
          this.refreshData();
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
          this.notificationService.showSuccess(`Tableau "${boardName}" supprimé.`);
          this.router.navigate(['/boards']);
        });
      }
    });
  }
}