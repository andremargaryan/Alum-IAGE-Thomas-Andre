import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Role } from '../../models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  prenom = '';
  nom = '';
  email = '';
  ville = 'Paris';
  role: Role = 'ETUDIANT';
  motDePasse = '';
  confirmPassword = '';

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (!this.prenom || !this.nom || !this.email || !this.motDePasse) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (this.motDePasse.length < 6) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (this.motDePasse !== this.confirmPassword) {
      this.errorMessage.set('Les deux mots de passe ne correspondent pas.');
      return;
    }

    this.loading.set(true);

    this.authService
      .register({
        nom: this.nom.trim(),
        prenom: this.prenom.trim(),
        email: this.email.trim(),
        motDePasse: this.motDePasse,
        ville: this.ville.trim(),
        role: this.role
      })
      .subscribe({
        next: () => {
          this.loading.set(false);
          this.successMessage.set('Compte créé ! Redirection vers la connexion...');
          setTimeout(() => this.router.navigate(['/login']), 1100);
        },
        error: (err) => {
          this.loading.set(false);
          const backendMsg =
            typeof err?.error === 'string'
              ? err.error
              : err?.error?.message || err?.error?.error;
          this.errorMessage.set(
            backendMsg || 'Impossible de créer le compte (vérifiez l’endpoint ou l’email).'
          );
        }
      });
  }
}