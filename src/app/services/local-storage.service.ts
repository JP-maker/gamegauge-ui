import { Injectable } from '@angular/core';
import { Board } from '../models/board.model'; // Réutiliser notre modèle existant

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly GUEST_BOARD_KEY = 'gamegauge_guest_board';

  constructor() { }

  /**
   * Sauvegarde le tableau de scores invité dans le localStorage.
   * @param board L'objet Board à sauvegarder.
   */
  saveGuestBoard(board: Board): void {
    try {
      localStorage.setItem(this.GUEST_BOARD_KEY, JSON.stringify(board));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde dans le localStorage', e);
    }
  }

  /**
   * Récupère le tableau de scores invité depuis le localStorage.
   * @returns L'objet Board ou null s'il n'existe pas.
   */
  getGuestBoard(): Board | null {
    try {
      const boardJson = localStorage.getItem(this.GUEST_BOARD_KEY);
      return boardJson ? JSON.parse(boardJson) : null;
    } catch (e) {
      console.error('Erreur lors de la lecture du localStorage', e);
      return null;
    }
  }

  /**
   * Supprime le tableau de scores invité du localStorage.
   */
  clearGuestBoard(): void {
    localStorage.removeItem(this.GUEST_BOARD_KEY);
  }
}