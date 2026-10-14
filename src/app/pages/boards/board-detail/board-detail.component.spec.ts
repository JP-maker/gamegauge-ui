import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardDetailComponent } from './board-detail.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Board, Participant } from '../../../models/board.model';
import { calculateGameStatus } from '../../../utils/game-status.utils';

describe('BoardDetailComponent', () => {
  let component: BoardDetailComponent;
  let fixture: ComponentFixture<BoardDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
      imports: [BoardDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BoardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('écran de victoire', () => {
    const BOARD_ID = 42;

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
        id: BOARD_ID,
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

    function check(b: Board): void {
      // `checkForVictory` est privée : c'est un détail d'implémentation du
      // composant, mais c'est elle qui porte toute la règle qu'on teste ici.
      (component as any).checkForVictory({ board: b, gameStatus: calculateGameStatus(b) });
    }

    beforeEach(() => {
      sessionStorage.removeItem(`gg-victory-${BOARD_ID}`);
      component.victory = null;
    });

    afterEach(() => {
      sessionStorage.removeItem(`gg-victory-${BOARD_ID}`);
    });

    it('reste muet tant que personne n\'a atteint la cible', () => {
      check(board({ Camille: [30, 20], 'Jean-Philippe': [25, 10] }));

      expect(component.victory).toBeNull();
    });

    it('annonce le vainqueur, son score et la couleur de son jeton', () => {
      // Jean-Philippe est le deuxième participant : son jeton est `player-2`,
      // comme dans le classement.
      check(board({ Camille: [40, 20], 'Jean-Philippe': [60, 52] }));

      expect(component.victory).toEqual({
        name: 'Jean-Philippe',
        colorClass: 'player-2',
        score: 112
      });
    });

    it('ne fête la victoire qu\'une seule fois', () => {
      const finished = board({ Camille: [40], 'Jean-Philippe': [120] });

      check(finished);
      expect(component.victory).not.toBeNull();

      // L'utilisateur ferme l'écran, puis les données sont rechargées — ce qui
      // arrive à chaque saisie de score et à chaque rechargement de page.
      component.closeVictory();
      check(finished);

      expect(component.victory).toBeNull();
    });

    it('réarme la célébration quand la partie repart', () => {
      const finished = board({ Camille: [40], 'Jean-Philippe': [120] });
      check(finished);
      component.closeVictory();

      // « Recommencer » remet les scores à zéro.
      check(board({ Camille: [], 'Jean-Philippe': [] }));
      expect(component.victory).toBeNull();

      check(finished);
      expect(component.victory).not.toBeNull();
    });

    it('ignore un rafraîchissement sans tableau', () => {
      expect(() => (component as any).checkForVictory(null)).not.toThrow();
      expect(component.victory).toBeNull();
    });
  });
});
