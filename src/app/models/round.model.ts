// Fichier : src/app/models/round.model.ts

export interface RoundData {
  roundNumber: number;
  // Un objet où la clé est l'ID du participant (un nombre)
  // et la valeur est son score (un nombre) ou null.
  scores: { [participantId: number]: number | null };
}