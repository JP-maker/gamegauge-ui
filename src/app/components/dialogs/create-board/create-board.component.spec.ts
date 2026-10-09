import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CreateBoardComponent } from './create-board.component';
import { CUSTOM_PRESET_ID, GAME_PRESETS } from '../../../data/game-presets';

describe('CreateBoardComponent', () => {
  let component: CreateBoardComponent;
  let fixture: ComponentFixture<CreateBoardComponent>;
  let closeSpy: jasmine.Spy;

  beforeEach(async () => {
    closeSpy = jasmine.createSpy('close');

    await TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        { provide: MatDialogRef, useValue: { close: closeSpy } },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      imports: [CreateBoardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('démarre sur une partie personnalisée', () => {
    expect(component.selectedPresetId).toBe(CUSTOM_PRESET_ID);
    expect(component.activePreset).toBeNull();
  });

  it('remplit le formulaire avec les règles du jeu choisi', () => {
    component.onPresetChange('skyjo');

    expect(component.createBoardForm.value).toEqual(jasmine.objectContaining({
      name: 'Skyjo',
      targetScore: 100,
      scoreCondition: 'LOWEST_WINS',
      numberOfRounds: null
    }));
    expect(component.activePreset?.id).toBe('skyjo');
  });

  it('gère un jeu sans score cible mais avec un nombre de manches', () => {
    component.onPresetChange('train-mexicain');

    expect(component.createBoardForm.value).toEqual(jasmine.objectContaining({
      targetScore: null,
      numberOfRounds: 13,
      scoreCondition: 'LOWEST_WINS'
    }));
  });

  it('repasse en personnalisée dès que l\'utilisateur retouche une valeur', () => {
    component.onPresetChange('uno');
    expect(component.activePreset?.id).toBe('uno');

    component.createBoardForm.get('targetScore')!.setValue(300);

    expect(component.activePreset).toBeNull();
    expect(component.selectedPresetId).toBe(CUSTOM_PRESET_ID);
  });

  it('ne renvoie que les champs attendus par l\'API', () => {
    component.onPresetChange('flip-7');
    component.onSave();

    expect(closeSpy).toHaveBeenCalledWith({
      name: 'Flip 7',
      targetScore: 200,
      scoreCondition: 'HIGHEST_WINS',
      numberOfRounds: null
    });
  });

  it('chaque préréglage est complet et cohérent', () => {
    GAME_PRESETS.forEach(preset => {
      expect(preset.id).toBeTruthy();
      expect(preset.name.length).toBeGreaterThan(2);
      expect(preset.summary.length).toBeGreaterThan(10);
      expect(['HIGHEST_WINS', 'LOWEST_WINS']).toContain(preset.scoreCondition);
      // Un jeu doit donner au moins une borne : un seuil ou un nombre de
      // manches. Le Scrabble fait exception, il n'a ni l'un ni l'autre.
      if (preset.id !== 'scrabble') {
        expect(preset.targetScore ?? preset.numberOfRounds).toBeTruthy();
      }
    });

    const ids = GAME_PRESETS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).not.toContain(CUSTOM_PRESET_ID);
  });
});
