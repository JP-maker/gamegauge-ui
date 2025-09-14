import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// 1. Importer `withInterceptors` et notre intercepteur
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    
    // 2. Modifier provideHttpClient pour inclure notre intercepteur
    provideHttpClient(withInterceptors([
      authInterceptor
    ]))
  ]
};