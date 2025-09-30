// Fichier : src/app/utils/game-status.utils.ts

import { Board, Participant } from "../models/board.model";

// 1. Définir et exporter l'interface pour le statut du jeu
export interface GameStatus {
  isGameOver: boolean;
  winner?: Participant;
  currentRound: number;
  remainingRounds?: number;
}

/**
 * Une fonction "pure" qui prend un objet Board et retourne l'état actuel du jeu.
 * @param board L'objet Board à analyser.
 * @returns Un objet GameStatus ou null si le board est invalide.
 */
export function calculateGameStatus(board: Board | null): GameStatus | null {
  // Garde de sécurité : ne rien faire si le board est invalide ou sans participants
  if (!board || !board.participants) {
    return null;
  }

  // --- 1. Calculer le score total pour chaque participant (source de vérité) ---
  // On enrichit temporairement chaque objet participant avec son score total pour ne pas le recalculer sans cesse.
  const participantsWithTotalScore = board.participants.map(p => ({
    ...p,
    totalScore: (p.scores || []).reduce((sum, s) => sum + s.scoreValue, 0)
  }));

  // --- 2. Déterminer le tour actuel ---
  let currentRound = 0;
  if (participantsWithTotalScore.length > 0) {
    // Le tour actuel est le plus grand numéro de tour entré parmi tous les scores de tous les joueurs
    currentRound = Math.max(0, ...participantsWithTotalScore.flatMap(p => p.scores.map(s => s.roundNumber)));
  }

  // --- 3. Vérifier les conditions de fin de partie ---
  let isGameOver = false;
  let winner: Participant | undefined;

  // Condition 3a : Fin par le nombre de tours
  if (board.numberOfRounds && board.numberOfRounds > 0 && currentRound >= board.numberOfRounds) {
    // On vérifie que le dernier tour est "complet" (tous les joueurs ont un score)
    const scoresInLastRound = participantsWithTotalScore.filter(p => p.scores.some(s => s.roundNumber === board.numberOfRounds)).length;
    if (scoresInLastRound === participantsWithTotalScore.length) {
      isGameOver = true;
    }
  }

  // Condition 3b : Fin par le score cible (n'est vérifiée que si la partie n'est pas déjà finie par les tours)
  if (!isGameOver && board.targetScore) {
    for (const p of participantsWithTotalScore) {
      if (board.scoreCondition === 'HIGHEST_WINS' && p.totalScore >= board.targetScore) {
        isGameOver = true;
        break; // Sortir de la boucle dès qu'un gagnant est trouvé
      }
      if (board.scoreCondition === 'LOWEST_WINS' && p.totalScore >= board.targetScore) { 
        isGameOver = true;
        break;
      }
    }
  }
  
  // --- 4. Déterminer le gagnant si la partie est finie ---
  if (isGameOver && participantsWithTotalScore.length > 0) {
    // On trie une COPIE des participants (enrichie avec le totalScore) pour trouver le gagnant.
    const sortedParticipants = [...participantsWithTotalScore].sort((a, b) => {
         // Si la condition est "le plus bas gagne", on trie par ordre croissant
         if (board.scoreCondition === 'LOWEST_WINS') {
           return a.totalScore - b.totalScore;
         }
         // Sinon, on trie par ordre décroissant (comportement par défaut)
         return b.totalScore - a.totalScore;
    });

    // Le gagnant est le premier élément de la liste triée
    winner = sortedParticipants[0];
  }
  
  // --- 5. Calculer les tours restants ---
  let remainingRounds: number | undefined;
  if (board.numberOfRounds) {
    remainingRounds = board.numberOfRounds - currentRound;
  }

  // --- 6. Retourner l'objet de statut complet ---
  return {
    isGameOver,
    winner,
    currentRound,
    remainingRounds
  };
}