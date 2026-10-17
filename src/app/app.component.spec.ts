import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { environment as prodEnvironment } from '../environments/environment.prod';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the toolbar logo', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.logo span')?.textContent).toContain('GameGauge');
  });

  it('affiche la version dans le pied de page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-footer .version')?.textContent?.trim()).toBe('dev');
  });

  it('propose le don depuis le pied de page', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('.app-footer a[href="/don"]') as HTMLAnchorElement;

    expect(link?.textContent?.trim()).toBe('Faire un don');
  });

  it('garde dans environment.prod le marqueur que la CI remplace', () => {
    // Le garde-fou de l'estampillage : si quelqu'un réécrit ce fichier sans le
    // marqueur, le `sed` de la CI ne trouve plus rien et la version affichée
    // en production se fige silencieusement.
    expect(prodEnvironment.version).toBe('VERSION_AU_BUILD');
  });
});
