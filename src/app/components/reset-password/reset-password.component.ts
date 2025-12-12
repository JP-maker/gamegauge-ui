import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  token: string = '';
  newPassword: string = '';
  message: string = '';
  error: string = '';
  isLoading: boolean = false;
  isSuccess: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // On récupère le token qui est dans l'URL (?token=XYZ)
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.error = "Token manquant ou invalide.";
      }
    });
  }

  onSubmit() {
    if (!this.newPassword || !this.token) return;

    this.isLoading = true;
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response: any) => {
        this.message = "Votre mot de passe a été modifié avec succès.";
        this.isSuccess = true;
        this.isLoading = false;
        // Optionnel : redirection automatique après 3 secondes
        // setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        this.error = "Le lien a expiré ou est invalide.";
        this.isLoading = false;
      }
    });
  }
}
