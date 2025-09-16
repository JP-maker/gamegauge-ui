import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Board } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.scss'
})
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  
  // On stocke les données sous forme d'Observable pour une gestion facile avec le pipe async
  boards$!: Observable<Board[]>;

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.boards$ = this.boardService.getBoards();
  }
}