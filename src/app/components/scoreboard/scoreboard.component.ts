// Fichier : src/app/components/scoreboard/scoreboard.component.ts

import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Board, Participant } from '../../models/board.model';
import { RoundData } from '../../models/round.model';
import { playerColorClass, playerInitials } from '../../utils/player-color.utils';

// Imports pour les types
import { GameStatus } from '../../utils/game-status.utils';

// Imports Material — le gabarit n'utilise plus que l'icône : le jeton est un
// bouton natif, et l'historique une table HTML simple, bien plus facile à
// styler qu'une mat-table.
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './scoreboard.component.html',
  styleUrl: './scoreboard.component.scss',
  animations: [
    trigger('crownAnimation', [
      // L'état de transition `:enter` se déclenche quand l'élément est ajouté au DOM
      transition(':enter', [
        // État initial (avant l'animation)
        style({
          transform: 'scale(0.5)', // Commence à 50% de sa taille
          opacity: 0                // Complètement transparent
        }),
        // Animation vers l'état final
        animate('300ms ease-out', style({
          transform: 'scale(1)',   // Finit à 100% de sa taille
          opacity: 1                  // Complètement opaque
        }))
      ])
    ])
  ]
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
   * Couleur de jeton de chaque joueur, attribuée une fois pour toutes d'après
   * sa position dans la partie. Le classement peut ensuite changer sans que la
   * couleur d'un joueur ne bouge : elle suit le joueur, jamais son rang.
   */
  private colorByParticipant = new Map<number, string>();

  /** Classe CSS portant la couleur du joueur. */
  colorOf(participant: Participant): string {
    return this.colorByParticipant.get(participant.id) ?? 'player-1';
  }

  /** Même chose à partir du seul identifiant, pour les en-têtes du tableau. */
  colorById(participantId: number): string {
    return this.colorByParticipant.get(participantId) ?? 'player-1';
  }

  /** Initiales inscrites dans le jeton. */
  initialsOf(participant: Participant): string {
    return playerInitials(participant.name);
  }

  /** Initiales à partir du seul identifiant, pour les en-têtes du tableau. */
  initialsById(participantId: number): string {
    return playerInitials(this.participantMap.get(participantId));
  }

  /** Vrai si ce joueur est le vainqueur désigné par le statut de la partie. */
  isWinner(participant: Participant): boolean {
    return !!this.gameStatus?.isGameOver && this.gameStatus?.winner?.id === participant.id;
  }

  /**
   * Points restants avant d'atteindre la cible — ou avant de la dépasser,
   * selon la condition de victoire. Retourne null s'il n'y a pas de cible.
   */
  pointsToGoal(participant: Participant): number | null {
    if (!this.board?.targetScore) {
      return null;
    }
    const total = this.getParticipantTotalScore(participant);

    return this.board.scoreCondition === 'LOWEST_WINS'
      ? total - this.board.targetScore
      : this.board.targetScore - total;
  }

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
      this.colorByParticipant.clear();
      return;
    }

    // 1. Créer la map des participants et la liste de leurs IDs
    this.participantMap.clear();
    this.participantIds = [];
    this.colorByParticipant.clear();
    board.participants.forEach((p, index) => {
        this.participantMap.set(p.id, p.name);
        this.participantIds.push(p.id);
        // La couleur vient de la position dans la partie, pas du classement.
        this.colorByParticipant.set(p.id, playerColorClass(index));
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