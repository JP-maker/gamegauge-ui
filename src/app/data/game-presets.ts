// Fichier : src/app/data/game-presets.ts

import { ScoreCondition } from '../models/board.model';

/**
 * Configurations de partie prêtes à l'emploi.
 *
 * Elles vivent dans le frontend et non en base : ce sont des constantes de
 * règles du jeu, pas des données d'utilisateur. Les faire passer par l'API
 * demanderait une table, une migration et un endpoint pour une liste qui ne
 * change qu'au rythme des mises en production.
 *
 * Chaque préréglage ne fait que pré-remplir le formulaire : l'utilisateur
 * reste libre de tout modifier avant de créer la partie. C'est important,
 * parce que beaucoup de ces jeux se jouent avec des variantes familiales.
 *
 * Les seuils ont été relevés dans les règles officielles ou de référence,
 * pas de mémoire — voir le tableau dans le README de la fonctionnalité.
 */
export interface GamePreset {
  /** Identifiant stable, utilisé par le sélecteur. */
  id: string;
  /** Nom proposé pour la partie. */
  name: string;
  /** Seuil qui met fin à la partie, ou null si le jeu n'en a pas. */
  targetScore: number | null;
  /** Qui l'emporte. Sert aussi à trier le classement, même sans seuil. */
  scoreCondition: ScoreCondition;
  /** Nombre de manches fixé par les règles, ou null. */
  numberOfRounds: number | null;
  /** Une ligne affichée sous le choix, pour confirmer ce qui est appliqué. */
  summary: string;
}

export const CUSTOM_PRESET_ID = 'custom';

export const GAME_PRESETS: GamePreset[] = [
  {
    id: 'six-qui-prend',
    name: '6 qui prend !',
    targetScore: 66,
    scoreCondition: 'LOWEST_WINS',
    numberOfRounds: null,
    summary: 'La partie s\'arrête dès qu\'un joueur dépasse 66 têtes de bœuf. Le moins chargé gagne.',
  },
  {
    id: 'skyjo',
    name: 'Skyjo',
    targetScore: 100,
    scoreCondition: 'LOWEST_WINS',
    numberOfRounds: null,
    summary: 'La partie s\'arrête dès qu\'un joueur atteint 100 points. Le plus bas total gagne.',
  },
  {
    id: 'train-mexicain',
    name: 'Train mexicain',
    targetScore: null,
    scoreCondition: 'LOWEST_WINS',
    numberOfRounds: 13,
    summary: '13 manches, du double-12 au double-0. Le plus bas total gagne.',
  },
  {
    id: 'flip-7',
    name: 'Flip 7',
    targetScore: 200,
    scoreCondition: 'HIGHEST_WINS',
    numberOfRounds: null,
    summary: 'La partie s\'arrête dès qu\'un joueur atteint 200 points. Le plus haut total gagne.',
  },
  {
    id: 'pili-pili',
    name: 'Pili Pili',
    targetScore: 7,
    scoreCondition: 'LOWEST_WINS',
    numberOfRounds: null,
    summary: 'On compte les pilis, qui sont des pénalités. La partie s\'arrête à 7 pilis, le moins chargé gagne.',
  },
  {
    id: 'rami',
    name: 'Rami',
    targetScore: 1000,
    scoreCondition: 'LOWEST_WINS',
    numberOfRounds: null,
    summary: 'Seuil courant de 1000 points de pénalité, le plus bas total gagne. Beaucoup de tables jouent un autre seuil.',
  },
  {
    id: 'uno',
    name: 'Uno',
    targetScore: 500,
    scoreCondition: 'HIGHEST_WINS',
    numberOfRounds: null,
    summary: 'Décompte officiel : premier à 500 points. Le plus haut total gagne.',
  },
  {
    id: 'scrabble',
    name: 'Scrabble',
    targetScore: null,
    scoreCondition: 'HIGHEST_WINS',
    numberOfRounds: null,
    summary: 'Ni seuil ni nombre de manches fixé : on joue jusqu\'à épuisement, le plus haut total gagne.',
  },
];

/** Retrouve un préréglage par son identifiant. */
export function findPreset(id: string | null): GamePreset | null {
  return GAME_PRESETS.find(preset => preset.id === id) ?? null;
}
