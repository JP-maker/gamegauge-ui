import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { Board } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);

  board$!: Observable<Board>;

  ngOnInit(): void {
    // On utilise les observables de la route pour récupérer l'ID
    // et charger les données du tableau de manière réactive.
    this.board$ = this.route.paramMap.pipe(
      switchMap(params => {
        const boardId = Number(params.get('id'));
        return this.boardService.getBoardById(boardId);
      })
    );
  }
}