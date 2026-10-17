import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { DonComponent } from './don.component';

describe('DonComponent', () => {
  let component: DonComponent;
  let fixture: ComponentFixture<DonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideRouter([]), provideNoopAnimations()],
      imports: [DonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(DonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crée', () => {
    expect(component).toBeTruthy();
  });

  it('affiche le QR code avec un texte de remplacement', () => {
    const img = fixture.nativeElement.querySelector('.qr img') as HTMLImageElement;

    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('don-paypal.png');
    expect(img.getAttribute('alt')).toContain('PayPal');
  });

  it('offre aussi le lien direct, pour qui est déjà sur son téléphone', () => {
    const link = fixture.nativeElement.querySelector('a.pay') as HTMLAnchorElement;

    expect(link.getAttribute('href')).toBe(component.paypalUrl);
    expect(component.paypalUrl.startsWith('https://www.paypal.com/')).toBeTrue();
  });

  it('ouvre PayPal dans un onglet neuf sans exposer la page d\'origine', () => {
    // `noopener` : sans lui, la page ouverte garde une référence vers la nôtre
    // et peut la rediriger. C'est la précaution classique du target="_blank".
    const link = fixture.nativeElement.querySelector('a.pay') as HTMLAnchorElement;

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });
});
