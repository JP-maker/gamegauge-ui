import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddScoreComponent } from './add-score.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('AddScoreComponent', () => {
  let component: AddScoreComponent;
  let fixture: ComponentFixture<AddScoreComponent>;

  let closeSpy: jasmine.Spy;

  beforeEach(async () => {
    closeSpy = jasmine.createSpy('close');
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: { participantName: 'Alice', nextRoundNumber: 1 } },
      ],
      imports: [AddScoreComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddScoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('scores négatifs', () => {
    const score = () => component.addScoreForm.get('scoreValue')!;
    const signButton = () => fixture.nativeElement.querySelector('button.sign') as HTMLButtonElement;

    it('le bouton ± inverse le signe', () => {
      score().setValue(15);

      signButton().click();
      expect(score().value).toBe(-15);

      signButton().click();
      expect(score().value).toBe(15);
    });

    it('ne produit jamais « -0 »', () => {
      score().setValue(0);

      component.toggleSign();

      expect(Object.is(score().value, 0)).toBeTrue();
    });

    it('le bouton ± ne soumet pas le formulaire', () => {
      expect(signButton().getAttribute('type')).toBe('button');

      signButton().click();

      expect(closeSpy).not.toHaveBeenCalled();
    });

    it('un score négatif reste valide et part tel quel', () => {
      score().setValue(-8);

      expect(component.addScoreForm.valid).toBeTrue();
      component.onSave();

      expect(closeSpy).toHaveBeenCalledWith({ scoreValue: -8, roundNumber: 1 });
    });
  });
});
