import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingComponent } from './landing.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Board } from '../../models/board.model';
import { LocalStorageService } from '../../services/local-storage.service';
import { GUEST_VICTORY_KEY, forgetCelebration } from '../../utils/victory.utils';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
      imports: [LandingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('partie rapide du mode invité', () => {
    /** Une partie gagnée par le deuxième joueur, à 100 points. */
    function finishedBoard(): Board {
      return {
        id: 0,
        name: 'Ma Partie Rapide',
        targetScore: 100,
        scoreCondition: 'HIGHEST_WINS',
        numberOfRounds: null,
        displayOrder: null,
        createdAt: '',
        updatedAt: '',
        ownerUsername: 'Invité',
        participants: [
          { id: 1, name: 'Camille', totalScore: 40, scores: [{ roundNumber: 1, scoreValue: 40 }] },
          { id: 2, name: 'Jean-Philippe', totalScore: 112, scores: [{ roundNumber: 1, scoreValue: 112 }] }
        ]
      };
    }

    beforeEach(() => {
      forgetCelebration(GUEST_VICTORY_KEY);
      component.victory = null;
    });

    afterEach(() => {
      forgetCelebration(GUEST_VICTORY_KEY);
      TestBed.inject(LocalStorageService).clearGuestBoard();
    });

    it('fête la victoire à la saisie du score qui termine la partie', () => {
      component.guestBoard = finishedBoard();
      (component as any).saveState();

      expect(component.victory).toEqual({
        name: 'Jean-Philippe',
        colorClass: 'player-2',
        score: 112
      });
    });

    it('calcule l\'état de la partie dès la réouverture de la page', () => {
      // Le mode invité relit sa partie depuis le navigateur : une partie déjà
      // terminée doit être reconnue comme telle sans attendre une saisie.
      TestBed.inject(LocalStorageService).saveGuestBoard(finishedBoard());

      component.loadGuestBoard();

      expect(component.gameStatus?.isGameOver).toBeTrue();
      expect(component.victory?.name).toBe('Jean-Philippe');
    });

    it('ne fête pas deux fois la même partie', () => {
      component.guestBoard = finishedBoard();
      (component as any).saveState();
      component.closeVictory();

      (component as any).saveState();

      expect(component.victory).toBeNull();
    });
  });
});
