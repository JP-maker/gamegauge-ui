import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';
  error: string = '';
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    if (!this.email) return;

    this.isLoading = true;
    this.message = '';
    this.error = '';

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response: any) => {
        // Affiche le message de succès (ex: "Si l'email existe...")
        this.message = typeof response === 'string' ? response : response.message || 'Lien envoyé !';
        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Une erreur est survenue. Vérifiez l'email.";
        this.isLoading = false;
      }
    });
  }
}
