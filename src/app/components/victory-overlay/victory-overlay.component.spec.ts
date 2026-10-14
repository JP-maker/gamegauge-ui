import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { VictoryOverlayComponent } from './victory-overlay.component';

describe('VictoryOverlayComponent', () => {
  let component: VictoryOverlayComponent;
  let fixture: ComponentFixture<VictoryOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideNoopAnimations()],
      imports: [VictoryOverlayComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VictoryOverlayComponent);
    component = fixture.componentInstance;
    component.winnerName = 'Jean-Philippe';
    component.score = 312;
    component.colorClass = 'player-4';
    fixture.detectChanges();
  });

  function text(selector: string): string {
    const node = fixture.nativeElement.querySelector(selector) as HTMLElement | null;
    return node?.textContent?.trim() ?? '';
  }

  it('se crée', () => {
    expect(component).toBeTruthy();
  });

  it('affiche le nom et le score du vainqueur', () => {
    expect(text('.name')).toBe('Jean-Philippe');
    expect(text('.score')).toBe('312 points');
  });

  it('accorde « point » au singulier', () => {
    component.score = 1;
    fixture.detectChanges();

    expect(text('.score')).toBe('1 point');
  });

  it('inscrit les initiales dans le jeton', () => {
    expect(text('.token')).toContain('JP');
  });

  it('porte la classe de couleur du joueur', () => {
    const overlay = fixture.nativeElement.querySelector('.victory') as HTMLElement;
    expect(overlay.classList).toContain('player-4');
  });

  it('émet `closed` au clic sur Continuer', () => {
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);

    (fixture.nativeElement.querySelector('.actions button') as HTMLElement).click();

    expect(spy).toHaveBeenCalled();
  });

  it('émet `closed` sur Échap', () => {
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);

    component.onEscape();

    expect(spy).toHaveBeenCalled();
  });

  it('se ferme au clic sur le fond, mais pas sur le contenu', () => {
    const spy = jasmine.createSpy('closed');
    component.closed.subscribe(spy);

    const overlay = fixture.nativeElement.querySelector('.victory') as HTMLElement;
    const stage = fixture.nativeElement.querySelector('.stage') as HTMLElement;

    stage.click();
    expect(spy).not.toHaveBeenCalled();

    overlay.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('arrête le moteur de confettis à la destruction', () => {
    // Le test porte sur le fait qu'aucune boucle ne survit au composant : une
    // animation laissée tourner continuerait de peindre sur un canvas détaché.
    expect(() => fixture.destroy()).not.toThrow();
  });
});
