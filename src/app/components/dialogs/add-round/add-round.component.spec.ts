import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { AddRoundComponent } from './add-round.component';
import { Participant } from '../../../models/board.model';

describe('AddRoundComponent', () => {
  let component: AddRoundComponent;
  let fixture: ComponentFixture<AddRoundComponent>;
  let closeSpy: jasmine.Spy;

  const participants: Participant[] = [
    {
      id: 11, name: 'Jean-Philippe', totalScore: 0,
      scores: [{ id: 1, roundNumber: 1, scoreValue: 14 }]
    },
    {
      id: 22, name: 'Marion', totalScore: 0,
      scores: [{ id: 2, roundNumber: 1, scoreValue: 23 }]
    }
  ];

  beforeEach(async () => {
    closeSpy = jasmine.createSpy('close');

    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: { participants, nextRoundNumber: 2 } }
      ],
      imports: [AddRoundComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AddRoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('propose une ligne par joueur, à zéro, sur la prochaine manche', () => {
    expect(component.scores.length).toBe(2);
    expect(component.roundForm.get('roundNumber')!.value).toBe(2);
    expect(component.scores.at(0).get('scoreValue')!.value).toBe(0);
  });

  it('recharge les valeurs quand on revient sur une manche déjà jouée', () => {
    component.roundForm.get('roundNumber')!.setValue(1);

    expect(component.scores.at(0).get('scoreValue')!.value).toBe(14);
    expect(component.scores.at(1).get('scoreValue')!.value).toBe(23);
  });

  it('renvoie des nombres, même si les champs ont été saisis en texte', () => {
    // Un input[type=number] renvoie une chaîne dès que l'utilisateur l'édite.
    component.scores.at(0).get('scoreValue')!.setValue('18' as unknown as number);
    component.scores.at(1).get('scoreValue')!.setValue('' as unknown as number);

    component.onSave();

    expect(closeSpy).toHaveBeenCalledWith({
      roundNumber: 2,
      scores: [
        { participantId: 11, scoreValue: 18 },
        { participantId: 22, scoreValue: 0 }
      ]
    });
  });
});
