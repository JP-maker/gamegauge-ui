import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Board } from '../../../models/board.model';
import { BoardService } from '../../../services/board.service';
import { CreateBoardComponent } from '../../../components/dialogs/create-board/create-board.component';
import { DragDropModule } from '@angular/cdk/drag-drop'; 
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NotificationService } from '../../../services/notification.service';

// Imports Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router'; 
import { MatDialog, MatDialogModule } from '@angular/material/dialog'; 
import { ConfirmComponent } from '../../../components/dialogs/confirm/confirm.component'; 
import { MatMenuModule } from '@angular/material/menu';


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
    MatDialogModule,
    MatDialogModule, 
    MatMenuModule,
    DragDropModule
  ],
  templateUrl: './board-list.component.html',
  styleUrl: './board-list.component.scss'
})
  
export class BoardListComponent implements OnInit {
  private boardService = inject(BoardService);
  private dialog = inject(MatDialog); // <-- INJECTER MatDialog
  private router = inject(Router); // <-- INJECTER Router
  private notificationService = inject(NotificationService); 

  boards: Board[] = [];
  isLoading = true;

  
  // On stocke les données sous forme d'Observable pour une gestion facile avec le pipe async
  boards$!: Observable<Board[]>;

  ngOnInit(): void {
    this.loadBoards();
  }

  loadBoards(): void {
    this.isLoading = true;
    this.boardService.getBoards().subscribe(data => {
      this.boards = data;
      this.isLoading = false;
    });
  }

  openCreateBoardDialog(): void {
    const dialogRef = this.dialog.open(CreateBoardComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      // `result` contient les données du formulaire si l'utilisateur a cliqué sur "Créer"
      if (result) {
        this.boardService.createBoard(result).subscribe(newBoard => {
          this.notificationService.showSuccess(`Le tableau "${newBoard.name}" a été créé avec succès.`);
          // Une fois le tableau créé, on navigue vers sa page de détail
          this.router.navigate(['/boards', newBoard.id]);
        });
      }
    });
  }

  onDeleteBoard(boardId: number, boardName: string, event: MouseEvent): void {
    // Empêche l'événement de clic de se propager à la carte entière,
    // ce qui déclencherait la navigation vers la page de détail.
    event.stopPropagation();

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: {
        title: 'Supprimer le tableau',
        message: `Êtes-vous sûr de vouloir supprimer le tableau "${boardName}" ?`
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.boardService.deleteBoard(boardId).subscribe(() => {
          this.notificationService.showSuccess(`Le tableau "${boardName}" a été supprimé.`);
          // Pour rafraîchir la liste, on rappelle simplement la méthode qui charge les données.
          this.loadBoards(); 
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<Board[]>) {
    // 1. Mettre à jour l'ordre visuel immédiatement pour une bonne UX
    moveItemInArray(this.boards, event.previousIndex, event.currentIndex);

    // 2. Extraire la nouvelle liste d'IDs
    const newOrderIds = this.boards.map(board => board.id);

    // 3. Appeler le service pour sauvegarder le nouvel ordre en arrière-plan
    this.boardService.updateOrder(newOrderIds).subscribe({
      next: () => this.notificationService.showSuccess('Nouvel ordre sauvegardé avec succès.'),
      error: (err) => {
        this.notificationService.showError('Erreur lors de la sauvegarde de l\'ordre');
        // Ici, on pourrait afficher un message d'erreur (Toast/Snackbar)
        // et potentiellement annuler le changement visuel.
      }
    });
  }
}