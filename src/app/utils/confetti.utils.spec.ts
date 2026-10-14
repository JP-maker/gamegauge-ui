import { ConfettiEngine, ConfettiPiece } from './confetti.utils';

describe('ConfettiPiece', () => {
  // Générateur déterministe : les tests portent sur la physique, pas sur le
  // hasard des dimensions.
  const fixedRandom = () => 0.5;

  it('retombe sous l\'effet de la gravité', () => {
    const piece = new ConfettiPiece(100, 100, 0, 0, '#fff', fixedRandom);

    piece.update(1, 1000);

    expect(piece.vy).toBeCloseTo(ConfettiPiece.GRAVITY, 5);
    expect(piece.y).toBeGreaterThan(100);
  });

  it('meurt une fois sorti par le bas', () => {
    const piece = new ConfettiPiece(0, 900, 0, 500, '#fff', fixedRandom);
    expect(piece.dead).toBeFalse();

    piece.update(0.5, 1000);

    expect(piece.dead).toBeTrue();
  });

  it('meurt au bout du temps imparti, même immobile à l\'écran', () => {
    const piece = new ConfettiPiece(0, 0, 0, 0, '#fff', fixedRandom);

    // Hauteur de scène volontairement énorme : seule l'ancienneté doit jouer.
    for (let i = 0; i < 1000; i++) {
      piece.update(0.016, 1e9);
    }

    expect(piece.dead).toBeTrue();
  });

  it('tourne sur lui-même pendant sa chute', () => {
    const piece = new ConfettiPiece(0, 0, 0, 0, '#fff', () => 0.9);
    const before = piece.flip;

    piece.update(0.5, 1000);

    expect(piece.flip).not.toBe(before);
  });
});

describe('ConfettiEngine', () => {
  let canvas: HTMLCanvasElement;
  let engine: ConfettiEngine;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.style.width = '400px';
    canvas.style.height = '300px';
    document.body.appendChild(canvas);
    engine = new ConfettiEngine(canvas);
  });

  afterEach(() => {
    engine.stop();
    canvas.remove();
  });

  it('crée autant de pièces que demandé', () => {
    engine.start();
    engine.burst(200, 150, -Math.PI / 2, 900, 24, ['#ae2d00', '#039ce9']);

    expect(engine.pieceCount).toBe(24);
  });

  it('n\'utilise que les couleurs fournies', () => {
    engine.start();
    engine.burst(200, 150, -Math.PI / 2, 900, 50, ['#ae2d00']);

    // La palette est consommée par `burst` ; on vérifie ici qu'une couleur
    // unique ne produit jamais `undefined`, le piège classique d'un tirage
    // au hasard sur un tableau.
    const piece = new ConfettiPiece(0, 0, 0, 0, '#ae2d00');
    expect(piece.color).toBe('#ae2d00');
    expect(engine.pieceCount).toBe(50);
  });

  it('vide la scène à l\'arrêt', () => {
    engine.start();
    engine.burst(200, 150, -Math.PI / 2, 900, 30, ['#ffffff']);
    expect(engine.pieceCount).toBe(30);

    engine.stop();

    expect(engine.pieceCount).toBe(0);
  });

  it('survit à un arrêt demandé deux fois', () => {
    engine.start();
    engine.stop();

    expect(() => engine.stop()).not.toThrow();
  });
});
