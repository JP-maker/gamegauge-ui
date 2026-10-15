import { TestBed } from '@angular/core/testing';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { of } from 'rxjs';

describe('authInterceptor', () => {
  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  /** Renvoie l'en-tête Authorization réellement envoyé, ou null. */
  function authHeaderFor(url: string): string | null {
    let sent: HttpRequest<unknown> | null = null;
    const next: HttpHandlerFn = req => {
      sent = req;
      return of({} as any);
    };

    interceptor(new HttpRequest('GET', url), next).subscribe();

    return sent!.headers.get('Authorization');
  }

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('n\'ajoute rien quand l\'utilisateur n\'est pas connecté', () => {
    spyOn(TestBed.inject(AuthService), 'getToken').and.returnValue(null);

    expect(authHeaderFor(`${environment.apiUrl}/boards`)).toBeNull();
  });

  it('ajoute le jeton aux appels vers notre API', () => {
    spyOn(TestBed.inject(AuthService), 'getToken').and.returnValue('jeton');

    expect(authHeaderFor(`${environment.apiUrl}/boards`)).toBe('Bearer jeton');
  });

  it('n\'envoie jamais le jeton à un autre domaine', () => {
    spyOn(TestBed.inject(AuthService), 'getToken').and.returnValue('jeton');

    expect(authHeaderFor('https://exemple.test/collecte')).toBeNull();
  });
});
