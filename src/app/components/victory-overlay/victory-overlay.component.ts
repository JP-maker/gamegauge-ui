// Fichier : src/app/components/victory-overlay/victory-overlay.component.ts

import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  Output,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { ConfettiEngine } from '../../utils/confetti.utils';
import { PLAYER_COLOR_COUNT, playerInitials } from '../../utils/player-color.utils';

/**
 * L'écran de fin de partie : le jeton du vainqueur tombe au centre, son nom
 * éclate derrière, et deux canons de confettis partent des coins bas.
 *
 * Le composant ne décide pas qu'il y a un vainqueur : il l'affiche. C'est le
 * parent qui le monte, une fois, quand `gameStatus.isGameOver` passe à vrai.
 */
@Component({
  selector: 'app-victory-overlay',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  templateUrl: './victory-overlay.component.html',
  styleUrl: './victory-overlay.component.scss'
})
export class VictoryOverlayComponent implements AfterViewInit, OnDestroy {
  /** Nom affiché en grand. */
  @Input({ required: true }) winnerName = '';
  /** Score total du vainqueur. */
  @Input() score = 0;
  /** Classe de couleur du joueur (`player-1` … `player-6`), posée par le parent. */
  @Input() colorClass = 'player-1';

  /** Émis quand l'utilisateur ferme l'écran. */
  @Output() closed = new EventEmitter<void>();

  @ViewChild('canvas') private canvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('continueButton', { read: ElementRef }) private continueRef?: ElementRef<HTMLElement>;

  private zone = inject(NgZone);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private engine: ConfettiEngine | null = null;

  get initials(): string {
    return playerInitials(this.winnerName);
  }

  ngAfterViewInit(): void {
    // L'écran prend le clavier : « Continuer » et Échap doivent suffire à en
    // sortir sans passer par la souris.
    this.continueRef?.nativeElement.focus({ preventScroll: true });

    if (!this.canvasRef || this.prefersReducedMotion()) {
      // Mouvement réduit : l'écran s'affiche dans son état final, sans
      // particules. Les animations CSS sont neutralisées par la feuille de
      // style du composant.
      return;
    }

    const canvas = this.canvasRef.nativeElement;

    // Hors zone Angular : la boucle d'animation ne doit pas déclencher une
    // détection de changement soixante fois par seconde.
    this.zone.runOutsideAngular(() => {
      const engine = new ConfettiEngine(canvas);
      this.engine = engine;
      engine.start();

      const width = () => canvas.clientWidth;
      const height = () => canvas.clientHeight;
      const palette = this.palette();

      // Jet central, au moment où le jeton se pose.
      engine.at(0.15, () => engine.burst(width() / 2, height() * 0.42, -Math.PI / 2, 900, 70, palette));
      // Les deux canons des coins bas.
      engine.at(0.45, () => engine.burst(-10, height() + 10, -Math.PI / 3.1, 1500, 60, palette));
      engine.at(0.50, () => engine.burst(width() + 10, height() + 10, -Math.PI + Math.PI / 3.1, 1500, 60, palette));
      // Retombée depuis le haut, pour que l'écran ne se vide pas d'un coup.
      engine.at(1.30, () => engine.burst(width() / 2, -20, Math.PI / 2, 420, 50, palette));
    });
  }

  ngOnDestroy(): void {
    this.engine?.stop();
    this.engine = null;
  }

  close(): void {
    this.closed.emit();
  }

  /** Fermeture au clic sur le fond, mais pas sur le contenu. */
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  /**
   * Les couleurs des confettis.
   *
   * Elles ne sont pas réécrites ici : on les relit sur le document, via une
   * sonde qui porte tour à tour chacune des classes `.player-N`. Les six
   * couleurs restent donc définies à un seul endroit, `styles/_variables.scss`,
   * et un changement de palette suit automatiquement jusqu'au papier.
   *
   * La couleur du vainqueur est doublée pour qu'elle domine. Le laiton s'y
   * ajoute plutôt que du blanc : il se voit sur le feutre comme sur le lin,
   * alors qu'un confetti blanc disparaît sur le thème clair.
   */
  private palette(): string[] {
    const element = this.host.nativeElement;
    const probe = document.createElement('span');
    probe.style.display = 'none';
    element.appendChild(probe);

    const colors: string[] = [];
    try {
      for (let i = 1; i <= PLAYER_COLOR_COUNT; i++) {
        probe.className = `player-${i}`;
        const value = getComputedStyle(probe).getPropertyValue('--player-bg').trim();
        if (value) {
          colors.push(value);
        }
      }
    } finally {
      probe.remove();
    }

    const brass = getComputedStyle(element).getPropertyValue('--brass').trim();

    if (colors.length === 0) {
      // Styles globaux absents (cas d'un test isolé) : le papier reste visible.
      return [brass || '#d9a84c'];
    }

    const index = Number(this.colorClass.replace('player-', '')) - 1;
    const own = colors[index] ?? colors[0];
    return brass ? [own, own, brass, ...colors] : [own, own, ...colors];
  }

  private prefersReducedMotion(): boolean {
    return typeof window !== 'undefined'
      && typeof window.matchMedia === 'function'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
