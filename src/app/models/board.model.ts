// Dans src/app/models/board.model.ts
export interface Participant {
  id: number;
  name: string;
  totalScore: number;
  scores: any[]; // On pourra typer ScoreEntry plus tard
}

export type ScoreCondition = 'HIGHEST_WINS' | 'LOWEST_WINS';

export interface Board {
  id: number;
  name: string;
  targetScore: number | null;
  scoreCondition: ScoreCondition | null;
  numberOfRounds: number | null;
  displayOrder: number | null;
  createdAt: string; // Les dates sont souvent transmises comme des chaînes de caractères
  updatedAt: string;
  ownerUsername: string;
  participants: Participant[];
}