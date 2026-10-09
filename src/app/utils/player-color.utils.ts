// Fichier : src/app/utils/player-color.utils.ts

/**
 * Attribution des couleurs de jetons.
 *
 * Les six couleurs sont définies une seule fois dans styles/_variables.scss et
 * exposées par les classes .player-1 … .player-6. Elles ont été générées en
 * OKLCH puis vérifiées par calcul : écart minimal de 11,5 entre deux jetons
 * sous déficience rouge-vert, 15,4 en vision normale.
 *
 * La couleur est attribuée par la POSITION du joueur dans la partie, et non
 * par son identifiant : deux joueurs d'une même partie ne peuvent donc pas
 * recevoir la même couleur tant qu'ils sont six ou moins. Au-delà, les
 * couleurs se répètent — c'est assumé, et l'initiale inscrite dans le jeton
 * reste là pour lever l'ambiguïté.
 */
export const PLAYER_COLOR_COUNT = 6;

/**
 * Classe CSS portant la couleur d'un joueur.
 * @param index Position du joueur dans la liste des participants de la partie.
 */
export function playerColorClass(index: number): string {
  const n = ((index % PLAYER_COLOR_COUNT) + PLAYER_COLOR_COUNT) % PLAYER_COLOR_COUNT;
  return `player-${n + 1}`;
}

/**
 * Initiales inscrites dans le jeton : deux lettres au plus.
 * C'est le second repère qui rend l'identité du joueur lisible même quand la
 * couleur ne suffit pas.
 */
export function playerInitials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/[\s'’-]+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}
