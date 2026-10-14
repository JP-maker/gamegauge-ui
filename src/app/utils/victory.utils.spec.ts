import { Board, Participant } from '../models/board.model';
import { calculateGameStatus } from './game-status.utils';
import { forgetCelebration, victoryKeyForBoard, victoryToCelebrate } from './victory.utils';

describe('victoryToCelebrate', () => {
  const KEY = 'gg-victory-test';

  function participant(id: number, name: string, scores: number[]): Participant {
    return {
      id,
      name,
      totalScore: scores.reduce((sum, value) => sum + value, 0),
      scores: scores.map((scoreValue, index) => ({ roundNumber: index + 1, scoreValue }))
    };
  }

  /** Une partie qui se gagne à 100 points, le plus haut score l'emportant. */
  function board(scores: { [name: string]: number[] }): Board {
    const names = Object.keys(scores);
    return {
      id: 7,
      name: 'Partie de test',
      targetScore: 100,
      scoreCondition: 'HIGHEST_WINS',
      numberOfRounds: null,
      displayOrder: null,
      createdAt: '',
      updatedAt: '',
      ownerUsername: 'jp',
      participants: names.map((name, index) => participant(index + 1, name, scores[name]))
    };
  }

  function celebrate(b: Board | null) {
    return victoryToCelebrate(KEY, b, b ? calculateGameStatus(b) : null);
  }

  beforeEach(() => forgetCelebration(KEY));
  afterEach(() => forgetCelebration(KEY));

  it('reste muet tant que personne n\'a atteint la cible', () => {
    expect(celebrate(board({ Camille: [30, 20], 'Jean-Philippe': [25, 10] }))).toBeNull();
  });

  it('annonce le vainqueur, son score et la couleur de son jeton', () => {
    // Jean-Philippe est le deuxième participant : son jeton est `player-2`,
    // comme dans le classement.
    expect(celebrate(board({ Camille: [40, 20], 'Jean-Philippe': [60, 52] }))).toEqual({
      name: 'Jean-Philippe',
      colorClass: 'player-2',
      score: 112
    });
  });

  it('ne fête la victoire qu\'une seule fois', () => {
    const finished = board({ Camille: [40], 'Jean-Philippe': [120] });

    expect(celebrate(finished)).not.toBeNull();
    expect(celebrate(finished)).toBeNull();
    expect(celebrate(finished)).toBeNull();
  });

  it('réarme la célébration quand la partie repart', () => {
    const finished = board({ Camille: [40], 'Jean-Philippe': [120] });
    expect(celebrate(finished)).not.toBeNull();

    // « Recommencer » remet les scores à zéro.
    expect(celebrate(board({ Camille: [], 'Jean-Philippe': [] }))).toBeNull();

    expect(celebrate(finished)).not.toBeNull();
  });

  it('accepte l\'absence de tableau sans broncher', () => {
    expect(celebrate(null)).toBeNull();
  });

  it('désigne le plus bas score quand c\'est la règle', () => {
    const lowest = board({ Camille: [120], 'Jean-Philippe': [40] });
    lowest.scoreCondition = 'LOWEST_WINS';

    expect(celebrate(lowest)?.name).toBe('Jean-Philippe');
  });

  it('donne une clé distincte à chaque partie', () => {
    expect(victoryKeyForBoard(12)).not.toBe(victoryKeyForBoard(13));
  });
});
