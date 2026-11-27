import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly HOST_URL = 'http://localhost:8080';
  private readonly STORAGE_KEY = 'alumni_auth';

  private readonly currentUserSignal = signal<AuthResponse | null>(this.loadFromStorage());

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);
  readonly userRole = computed<Role | null>(() => this.currentUserSignal()?.role ?? null);

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.HOST_URL}/api/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(response));
        this.currentUserSignal.set(response);
      })
    );
  }

  register(payload: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.HOST_URL}/users`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentUserSignal()?.token ?? null;
  }

  hasRole(roles: Role[]): boolean {
    const role = this.userRole();
    return role !== null && roles.includes(role);
  }

  private loadFromStorage(): AuthResponse | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthResponse;
    } catch {
      localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }
}