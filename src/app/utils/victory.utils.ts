/**
 * Fichier : src/app/utils/victory.utils.ts
 *
 * La règle de déclenchement de l'écran de victoire, au même endroit pour les
 * deux écrans qui affichent un tableau de scores : la partie enregistrée
 * (`board-detail`) et la partie rapide du mode invité (`landing`).
 *
 * La difficulté n'est pas de détecter la fin de partie — `calculateGameStatus`
 * s'en charge — mais de ne la fêter qu'une fois. Les données sont recalculées à
 * chaque saisie de score et rechargées à chaque ouverture de page : sans
 * mémoire, l'écran reviendrait sans arrêt. D'où le repère posé dans
 * `sessionStorage`, effacé dès que la partie n'est plus terminée, c'est-à-dire
 * dès qu'elle repart.
 */

import { Board } from '../models/board.model';
import { GameStatus } from './game-status.utils';
import { playerColorClass } from './player-color.utils';

/** Ce que l'écran de victoire a besoin de savoir. */
export interface VictoryView {
  name: string;
  colorClass: string;
  score: number;
}

/** Clé de mémoire d'une partie enregistrée. */
export function victoryKeyForBoard(boardId: number): string {
  return `gg-victory-${boardId}`;
}

/** Clé de mémoire de la partie rapide du mode invité. */
export const GUEST_VICTORY_KEY = 'gg-victory-invite';

/**
 * Décide s'il faut fêter la victoire maintenant.
 *
 * @returns L'écran à afficher, ou `null` : soit la partie n'est pas terminée
 *          (et la mémoire est alors effacée, ce qui réarme la célébration pour
 *          la prochaine), soit elle a déjà été fêtée.
 */
export function victoryToCelebrate(
  key: string,
  board: Board | null | undefined,
  status: GameStatus | null | undefined
): VictoryView | null {
  if (!board || !status?.isGameOver || !status.winner) {
    forgetCelebration(key);
    return null;
  }

  if (wasCelebrated(key)) {
    return null;
  }
  rememberCelebration(key);

  const winner = status.winner;
  const position = (board.participants || []).findIndex(p => p.id === winner.id);

  return {
    name: winner.name,
    // La couleur du jeton vient de la position du joueur dans la partie,
    // exactement comme dans le classement : le jeton qui tombe au centre est
    // bien celui que le joueur avait sous les yeux.
    colorClass: playerColorClass(position < 0 ? 0 : position),
    score: (winner.scores || []).reduce((sum, s) => sum + s.scoreValue, 0)
  };
}

export function wasCelebrated(key: string): boolean {
  try {
    return sessionStorage.getItem(key) !== null;
  } catch {
    // Stockage indisponible (navigation privée verrouillée, par exemple) :
    // mieux vaut fêter deux fois que pas du tout.
    return false;
  }
}

export function rememberCelebration(key: string): void {
  try {
    sessionStorage.setItem(key, '1');
  } catch {
    // Sans mémoire, l'écran pourra réapparaître : ce n'est pas bloquant.
  }
}

export function forgetCelebration(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Rien à faire.
  }
}
