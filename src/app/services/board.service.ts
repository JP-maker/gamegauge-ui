import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Board } from '../models/board.model'; // <-- Importer notre interface

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
}