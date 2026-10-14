/**
 * Fichier : src/app/utils/confetti.utils.ts
 *
 * Le moteur de confettis de l'écran de victoire.
 *
 * Il est volontairement séparé du composant : aucune dépendance à Angular, ni
 * au DOM en dehors du canvas qu'on lui confie. C'est ce qui permet de tester la
 * physique d'un confetti sans monter de composant ni peindre quoi que ce soit.
 *
 * Deux partis pris :
 *  · la boucle tourne hors de la zone Angular (c'est l'appelant qui s'en
 *    charge), sans quoi chaque image déclencherait une détection de changement,
 *    soit une soixantaine par seconde pour rien ;
 *  · le minutage des salves est porté par la boucle elle-même et non par des
 *    setTimeout, pour que `stop()` suffise à tout éteindre.
 */

/** Un confetti : un rectangle de papier qui tourne sur lui-même en retombant. */
export class ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  readonly width: number;
  readonly height: number;
  readonly color: string;

  /** Rotation dans le plan de l'écran. */
  rotation: number;
  /** Phase du retournement : c'est elle qui fait « battre » le papier. */
  flip: number;

  private readonly spin: number;
  private readonly flipSpeed: number;
  private age = 0;
  private finished = false;

  /** Gravité, en pixels par seconde au carré. */
  static readonly GRAVITY = 1250;
  /** Au-delà, un confetti encore à l'écran est retiré par sécurité. */
  static readonly MAX_AGE = 8;

  constructor(x: number, y: number, vx: number, vy: number, color: string, random: () => number = Math.random) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.color = color;
    this.width = 6 + random() * 5;
    this.height = 9 + random() * 7;
    this.rotation = random() * Math.PI * 2;
    this.flip = random() * Math.PI * 2;
    this.spin = (random() - 0.5) * 18;
    this.flipSpeed = 4 + random() * 7;
  }

  get dead(): boolean {
    return this.finished;
  }

  /**
   * Avance la pièce d'un pas de temps.
   * @param dt Durée écoulée, en secondes.
   * @param height Hauteur de la scène : en dessous, la pièce est retirée.
   */
  update(dt: number, height: number): void {
    this.age += dt;
    this.vy += ConfettiPiece.GRAVITY * dt;
    this.vx *= 0.992;
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += this.spin * dt;
    this.flip += this.flipSpeed * dt;

    if (this.y > height + 40 || this.age > ConfettiPiece.MAX_AGE) {
      this.finished = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    // Le papier vu de biais : on écrase le rectangle au rythme du retournement.
    ctx.scale(1, Math.max(0.12, Math.abs(Math.cos(this.flip))));
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
    ctx.restore();
  }
}

interface ScheduledBurst {
  due: number;
  run: () => void;
}

export class ConfettiEngine {
  private ctx: CanvasRenderingContext2D | null = null;
  private pieces: ConfettiPiece[] = [];
  private scheduled: ScheduledBurst[] = [];
  private frame = 0;
  private lastFrameAt = 0;
  private elapsed = 0;
  private readonly onResize = () => this.resize();

  constructor(private readonly canvas: HTMLCanvasElement) {}

  /** Nombre de confettis encore en vol — utile aux tests. */
  get pieceCount(): number {
    return this.pieces.length;
  }

  start(): void {
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      return;
    }
    this.resize();
    window.addEventListener('resize', this.onResize);
    this.lastFrameAt = performance.now();
    this.frame = requestAnimationFrame(now => this.tick(now));
  }

  stop(): void {
    if (this.frame) {
      cancelAnimationFrame(this.frame);
      this.frame = 0;
    }
    window.removeEventListener('resize', this.onResize);
    this.pieces = [];
    this.scheduled = [];
    this.ctx = null;
  }

  /** Programme une salve pour dans `delay` secondes. */
  at(delay: number, run: () => void): void {
    this.scheduled.push({ due: this.elapsed + delay, run });
  }

  /**
   * Tire une salve de confettis.
   * @param x Abscisse du canon.
   * @param y Ordonnée du canon.
   * @param angle Direction, en radians (-PI/2 pointe vers le haut).
   * @param power Vitesse initiale, en pixels par seconde.
   * @param count Nombre de pièces.
   * @param colors Couleurs tirées au hasard pour chaque pièce.
   */
  burst(x: number, y: number, angle: number, power: number, count: number, colors: string[]): void {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * 0.84;
      const speed = power * (0.55 + Math.random() * 0.45);
      this.pieces.push(new ConfettiPiece(
        x, y,
        Math.cos(a) * speed,
        Math.sin(a) * speed,
        colors[Math.floor(Math.random() * colors.length)] ?? colors[0]
      ));
    }
  }

  private resize(): void {
    if (!this.ctx) {
      return;
    }
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.canvas.clientWidth * ratio);
    this.canvas.height = Math.floor(this.canvas.clientHeight * ratio);
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  private tick(now: number): void {
    // On plafonne le pas de temps : si l'onglet a été mis en arrière-plan, la
    // physique ne doit pas rattraper d'un seul bond plusieurs secondes.
    const dt = Math.min((now - this.lastFrameAt) / 1000, 0.05);
    this.lastFrameAt = now;
    this.elapsed += dt;

    for (let i = this.scheduled.length - 1; i >= 0; i--) {
      if (this.elapsed >= this.scheduled[i].due) {
        const burst = this.scheduled[i].run;
        this.scheduled.splice(i, 1);
        burst();
      }
    }

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    const ctx = this.ctx;

    if (ctx) {
      ctx.clearRect(0, 0, width, height);
      for (let i = this.pieces.length - 1; i >= 0; i--) {
        const piece = this.pieces[i];
        piece.update(dt, height);
        if (piece.dead) {
          this.pieces.splice(i, 1);
          continue;
        }
        piece.draw(ctx);
      }
    }

    this.frame = requestAnimationFrame(next => this.tick(next));
  }
}
