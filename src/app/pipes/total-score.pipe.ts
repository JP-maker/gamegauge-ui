import { Pipe, PipeTransform } from '@angular/core';
import { ScoreEntryResponse } from '../models/score-entry.model';

@Pipe({
  name: 'totalScore',
  standalone: true,
  pure: false
})
export class TotalScorePipe implements PipeTransform {

  transform(scores: ScoreEntryResponse[] | undefined): number {
    if (!scores || scores.length === 0) {
      return 0;
    }
    
    // Fait la somme de toutes les `scoreValue` dans le tableau
    return scores.reduce((sum, current) => sum + current.scoreValue, 0);
  }

}