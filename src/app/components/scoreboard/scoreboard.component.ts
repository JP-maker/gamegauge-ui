// Fichier : src/app/components/scoreboard/scoreboard.component.ts

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Board, Participant } from '../../models/board.model';
import { RoundData } from '../../models/round.model';

// Imports pour les types
import { GameStatus } from '../../utils/game-status.utils';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule
  ],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss'
})
export class ScoreboardComponent implements OnChanges {
  // --- ENTRÉES (Inputs) ---
  // Reçoit l'objet Board complet à afficher
  @Input() board: Board | null = null;
  // Reçoit l'état du jeu calculé par le composant parent
  @Input() gameStatus: GameStatus | null = null;

  // --- SORTIES (Outputs) ---
  // Émet un événement lorsque l'utilisateur veut ajouter un score à un participant
  @Output() addScore = new EventEmitter<Participant>();
  // Émet un événement lorsque l'utilisateur veut gérer les participants (obsolète ici, géré par le parent)
  // Note: La gestion des participants est sur le header, donc cet Output n'est plus forcément nécessaire.
  // On le garde pour la flexibilité.
  @Output() manageParticipants = new EventEmitter<void>();

  // --- PROPRIÉTÉS INTERNES pour l'affichage ---
  sortedParticipants: Participant[] = [];
  roundsData: RoundData[] = [];
  displayedColumns: string[] = [];
  participantMap = new Map<number, string>();
  participantIds: number[] = [];

  /**
   * Hook de cycle de vie d'Angular.
   * Cette méthode est appelée à chaque fois qu'une des propriétés @Input change.
   * C'est l'endroit parfait pour recalculer les données d'affichage (comme le tableau récapitulatif).
   */
  ngOnChanges(changes: SimpleChanges): void {
    // On ne recalcule que si la donnée 'board' a réellement changé
    if (changes['board'] && this.board) {
      this.processBoardData(this.board);
      this.sortParticipants();
    }
  }
  
  // Calcule le score total pour un participant donné.
  // Elle sera appelée directement depuis le template.
  getParticipantTotalScore(participant: Participant): number {
    if (!participant.scores || participant.scores.length === 0) {
      return 0;
    }
    return participant.scores.reduce((sum, current) => sum + current.scoreValue, 0);
  }
  
  /**
   * Transforme les données du tableau de scores pour les préparer à l'affichage
   * dans le tableau récapitulatif (mat-table).
   * @param board L'objet Board à traiter.
   */
  private processBoardData(board: Board): void {
    if (!board.participants) {
      this.roundsData = [];
      this.displayedColumns = [];
      this.participantMap.clear();
      this.participantIds = [];
      return;
    }

    // 1. Créer la map des participants et la liste de leurs IDs
    this.participantMap.clear();
    this.participantIds = [];
    board.participants.forEach(p => {
        this.participantMap.set(p.id, p.name);
        this.participantIds.push(p.id);
    });

    // 2. Définir les colonnes du tableau Material
    this.displayedColumns = ['roundNumber', ...board.participants.map(p => p.id.toString())];

    // 3. Transformer les données de scores en une structure par tour
    const roundsMap = new Map<number, { [participantId: number]: number | null }>();
    let maxRound = 0;
    
    board.participants.forEach(p => {
        (p.scores || []).forEach(s => {
            const round = roundsMap.get(s.roundNumber) || {};
            round[p.id] = s.scoreValue;
            roundsMap.set(s.roundNumber, round);
            if (s.roundNumber > maxRound) { maxRound = s.roundNumber; }
        });
    });

    // 4. Convertir la map en un tableau trié, en s'assurant que tous les tours sont présents
    this.roundsData = Array.from({ length: maxRound }, (_, i) => i + 1)
        .map(roundNum => {
            const scoresForRound = roundsMap.get(roundNum) || {};
            board.participants.forEach(p => {
                if (!scoresForRound.hasOwnProperty(p.id)) { scoresForRound[p.id] = null; }
            });
            return { roundNumber: roundNum, scores: scoresForRound };
        });
  }

  // NOUVELLE MÉTHODE
  private sortParticipants(): void {
    if (!this.board || !this.board.participants) {
      this.sortedParticipants = [];
      return;
    }
    
    // Créer une copie pour ne pas muter l'input
    this.sortedParticipants = [...this.board.participants].sort((a, b) => {
      const scoreA = this.getParticipantTotalScore(a);
      const scoreB = this.getParticipantTotalScore(b);

      if (this.board?.scoreCondition === 'LOWEST_WINS') {
        return scoreA - scoreB; // Tri croissant
      }
      return scoreB - scoreA; // Tri décroissant (défaut)
    });
  }
}