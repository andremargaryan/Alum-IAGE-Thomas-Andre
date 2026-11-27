import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  motDePasse = '';
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.email || !this.motDePasse) {
      this.errorMessage.set('Veuillez remplir votre email et votre mot de passe.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, motDePasse: this.motDePasse }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/events']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('Identifiants invalides ou serveur indisponible.');
      }
    });
  }
}