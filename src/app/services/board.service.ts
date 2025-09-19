import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board, Participant } from '../models/board.model'; // <-- Importer notre interface
import { ScoreEntryResponse } from '../models/score-entry.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/boards';

  /**
   * Récupère tous les tableaux de l'utilisateur authentifié.
   * L'intercepteur s'occupe d'ajouter le token JWT.
   */
  getBoards(): Observable<Board[]> {
    return this.http.get<Board[]>(this.apiUrl);
  }

  /**
   * Récupère un seul tableau de scores par son ID.
   * @param id L'ID du tableau à récupérer.
   */
  getBoardById(id: number): Observable<Board> {
    return this.http.get<Board>(`${this.apiUrl}/${id}`);
  }

   /**
   * Ajoute un participant à un tableau de scores.
   * @param boardId L'ID du tableau.
   * @param participantName Le nom du nouveau participant.
   */
  addParticipant(boardId: number, participantName: string): Observable<Participant> {
    const payload = { name: participantName };
    return this.http.post<Participant>(`${this.apiUrl}/${boardId}/participants`, payload);
  }

  /**
   * Supprime un participant d'un tableau de scores.
   * @param boardId L'ID du tableau.
   * @param participantId L'ID du participant à supprimer.
   */
  removeParticipant(boardId: number, participantId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${boardId}/participants/${participantId}`);
  }

  /**
   *  Définit (crée ou met à jour) le score d'un participant pour un round spécifique.
   * @param boardId 
   * @param participantId 
   * @param scoreData 
   * @returns 
   */
  setScore(boardId: number, participantId: number, scoreData: { scoreValue: number, roundNumber: number }): Observable<ScoreEntryResponse> {
    const url = `${this.apiUrl}/${boardId}/participants/${participantId}/scores`;
    return this.http.put<ScoreEntryResponse>(url, scoreData);
  }

  /**
   * Crée un nouveau tableau de scores.
   * @param boardData Les données du tableau (name, targetScore, etc.).
   */
  createBoard(boardData: Partial<Board>): Observable<Board> {
    // Le type Partial<Board> signifie que l'objet peut n'avoir que certaines propriétés de Board.
    return this.http.post<Board>(this.apiUrl, boardData);
  }
}