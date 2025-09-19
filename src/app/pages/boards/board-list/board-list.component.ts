import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Board } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';
import { CreateBoardComponent } from '../../../components/dialogs/create-board/create-board.component';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router'; // <-- Nouvel import
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; // <-- Nouveaux imports


@Component({
  selector: 'app-board-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.scss'
})
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  private dialog = inject(MatDialog); // <-- INJECTER MatDialog
  private router = inject(Router); // <-- INJECTER Router
  
  // On stocke les données sous forme d'Observable pour une gestion facile avec le pipe async
  boards$!: Observable<Board[]>;

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.boards$ = this.boardService.getBoards();
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // `result` contient les données du formulaire si l'utilisateur a cliqué sur "Créer"
      if (result) {
        this.boardService.createBoard(result).subscribe(newBoard => {
          // Une fois le tableau créé, on navigue vers sa page de détail
          this.router.navigate(['/boards', newBoard.id]);
        });
      }
    });
  }
}