// Fichier : src/app/utils/game-status.utils.ts

import { Board, Participant } from "../models/board.model";

// 1. Définir et exporter l'interface pour le statut du jeu
export interface GameStatus {
  isGameOver: boolean;
  winner?: Participant;
  currentRound: number;
  remainingRounds?: number;
}

// 2. Définir et exporter notre fonction de calcul
export function calculateGameStatus(board: Board | null): GameStatus | null {
  if (!board || !board.participants) {
    return null;
  }

  let currentRound = 0;
  if (board.participants.length > 0) {
    currentRound = Math.max(0, ...board.participants.flatMap(p => p.scores.map(s => s.roundNumber)));
  }

  let isGameOver = false;
  let winner: Participant | undefined;
  let remainingRounds: number | undefined;

  // ... (coller ici TOUTE la logique de calcul de l'ancienne méthode)
  if (board.numberOfRounds && currentRound >= board.numberOfRounds) {
    const scoresInLastRound = board.participants.filter(p => p.scores.some(s => s.roundNumber === board.numberOfRounds)).length;
    if (scoresInLastRound === board.participants.length) {
      isGameOver = true;
    }
  }

  if (board.targetScore) {
    board.participants.forEach(p => {
      const totalScore = p.scores.reduce((sum, s) => sum + s.scoreValue, 0);
      if (board.scoreCondition === 'HIGHEST_WINS' && totalScore >= board.targetScore!) {
        isGameOver = true;
      }
      if (board.scoreCondition === 'LOWEST_WINS' && totalScore <= board.targetScore!) {
        isGameOver = true;
      }
    });
  }
  
  if (isGameOver && board.participants.length > 0) {
    // On crée une fonction pour calculer le score total, pour ne pas répéter le code
    const getTotalScore = (p: Participant) => p.scores.reduce((sum, s) => sum + s.scoreValue, 0);
    
    // On trie une COPIE des participants pour déterminer le gagnant
    const sortedParticipants = [...board.participants].sort((a, b) => {
         const scoreA = getTotalScore(a);
         const scoreB = getTotalScore(b);

         // Si la condition est "le plus bas gagne", on trie par ordre croissant
         if (board.scoreCondition === 'LOWEST_WINS') {
           return scoreA - scoreB;
         }
         // Sinon, on trie par ordre décroissant (comportement par défaut)
         return scoreB - scoreA;
    });

    // Le gagnant est le premier élément de la liste triée
    winner = sortedParticipants[0];
  }
  
  if (board.numberOfRounds) {
    remainingRounds = board.numberOfRounds - currentRound;
  }

  return {
    isGameOver,
    winner,
    currentRound,
    remainingRounds
  };
}