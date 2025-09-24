import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs'; // <-- NOUVEL IMPORT
import { map, shareReplay, startWith } from 'rxjs/operators'; // <-- NOUVEL IMPORT: startWith, shareReplay
import { AuthService } from './services/auth.service';

// Imports pour Angular CDK Layout
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout'; // <-- NOUVEAUX IMPORTS

// Imports pour Angular Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    AsyncPipe, // <-- AJOUTER ICI
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  // Injecter le BreakpointObserver
  private breakpointObserver = inject(BreakpointObserver);
  public authService = inject(AuthService);

  // Créer un Observable qui émet `true` si l'écran correspond à la taille d'un smartphone
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      // Assure que l'observable émet immédiatement la valeur actuelle au chargement
      startWith(this.breakpointObserver.isMatched(Breakpoints.Handset)),
      // Met en cache la dernière valeur pour les nouveaux souscripteurs, évite les exécutions multiples
      shareReplay(1) 
    );
    
  onLogout(): void {
    this.authService.logout();
  }
}