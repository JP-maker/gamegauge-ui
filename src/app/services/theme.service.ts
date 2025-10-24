import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'light-theme' | 'dark-theme';

  constructor(rendererFactory: RendererFactory2, private overlayContainer: OverlayContainer ) {
    // On utilise Renderer2 pour manipuler le DOM de manière sûre (utile pour le SSR plus tard)
    this.renderer = rendererFactory.createRenderer(null, null);

    // Au démarrage, on charge le thème sauvegardé ou on utilise le thème sombre par défaut
    const savedTheme = localStorage.getItem('theme') as 'light-theme' | 'dark-theme' | null;
    this.currentTheme = savedTheme || 'dark-theme';
    this.applyTheme(this.currentTheme);
  }

  /**
   * Applique un thème en ajoutant/supprimant les classes CSS sur le body.
   * @param theme Le nom du thème ('light-theme' ou 'dark-theme')
   */
  private applyTheme(theme: 'light-theme' | 'dark-theme'): void {
    const newThemeClass = theme;
    const oldThemeClass = theme === 'light-theme' ? 'dark-theme' : 'light-theme';

    // Appliquer au body 
    this.renderer.removeClass(document.body, oldThemeClass);
    this.renderer.addClass(document.body, newThemeClass);

    // Appliquer AUSSI au conteneur de l'overlay pour les dialogues, menus, etc.
    const overlayContainerElement = this.overlayContainer.getContainerElement();
    this.renderer.removeClass(overlayContainerElement, oldThemeClass);
    this.renderer.addClass(overlayContainerElement, newThemeClass);
  }

  /**
   * Bascule entre le thème clair et le thème sombre.
   */
  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark-theme' ? 'light-theme' : 'dark-theme';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme(this.currentTheme);
  }
  
  /**
   * Retourne le thème actuel (utile pour afficher la bonne icône).
   */
  getCurrentTheme(): 'light-theme' | 'dark-theme' {
    return this.currentTheme;
  }
}