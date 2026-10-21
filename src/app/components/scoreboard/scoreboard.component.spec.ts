import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { ScoreboardComponent } from './scoreboard.component';
import { Board, Participant, ScoreCondition } from '../../models/board.model';

describe('ScoreboardComponent', () => {
  let component: ScoreboardComponent;
  let fixture: ComponentFixture<ScoreboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideNoopAnimations()],
      imports: [ScoreboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoreboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function player(total: number): Participant {
    return { id: 1, name: 'Camille', totalScore: total, scores: [{ roundNumber: 1, scoreValue: total }] };
  }

  function boardWith(condition: ScoreCondition, target: number | null): Board {
    return {
      id: 1, name: 'Test', targetScore: target, scoreCondition: condition,
      numberOfRounds: null, displayOrder: null, createdAt: '', updatedAt: '',
      ownerUsername: 'jp', participants: []
    };
  }

  describe('distance à la cible', () => {
    it('« le plus haut gagne » : ce qui reste à marquer', () => {
      component.board = boardWith('HIGHEST_WINS', 100);
      expect(component.pointsToGoal(player(42))).toBe(58);
    });

    it('« le plus bas gagne » : ce qui reste avant la défaite, positif', () => {
      // La refonte affichait « -58 points avant défaite » ici.
      component.board = boardWith('LOWEST_WINS', 100);
      expect(component.pointsToGoal(player(42))).toBe(58);
    });

    it('un total négatif éloigne de la cible', () => {
      component.board = boardWith('LOWEST_WINS', 100);
      expect(component.pointsToGoal(player(-28))).toBe(128);
    });

    it('rien sans cible', () => {
      component.board = boardWith('HIGHEST_WINS', null);
      expect(component.pointsToGoal(player(42))).toBeNull();
    });
  });

  describe('taille du chiffre dans le jeton', () => {
    it('garde la taille normale jusqu\'à trois caractères', () => {
      expect(component.isLongScore(player(999))).toBeFalse();
      expect(component.isLongScore(player(-99))).toBeFalse();
    });

    it('rétrécit à partir de quatre, signe moins compris', () => {
      expect(component.isLongScore(player(-128))).toBeTrue();
      expect(component.isLongScore(player(1250))).toBeTrue();
    });
  });
});
