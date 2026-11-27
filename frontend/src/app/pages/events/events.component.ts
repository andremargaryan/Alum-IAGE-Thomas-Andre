import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { EventService } from '../../core/services/event.service';
import {
  EventItem,
  InscriptionStatus,
  ParticipantsResponse
} from '../../models/event.model';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  private readonly eventService = inject(EventService);

  motCle = '';
  lieu = '';
  aVenir = true;

  readonly events = signal<EventItem[]>([]);
  readonly inscriptionsByEvent = signal<Record<number, InscriptionStatus>>({});
  readonly participantsByEvent = signal<Record<number, ParticipantsResponse>>({});
  readonly openParticipantsIds = signal<Set<number>>(new Set());
  readonly loadingParticipantsIds = signal<Set<number>>(new Set());
  readonly pendingEventIds = signal<Set<number>>(new Set());

  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly feedbackMessage = signal<{ eventId: number; text: string; type: 'success' | 'info' | 'error' } | null>(null);

  readonly hasActiveFilters = computed(
    () => this.motCle.trim().length > 0 || this.lieu.trim().length > 0 || !this.aVenir
  );

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.eventService
      .getEvents({
        motCle: this.motCle,
        lieu: this.lieu,
        aVenir: this.aVenir
      })
      .subscribe({
        next: (items) => {
          this.events.set(items);
          this.loading.set(false);
          this.loadMyInscriptions(items);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(
            this.extractErrorMessage(err) || 'Impossible de charger les événements.'
          );
        }
      });
  }

  onSearch(): void {
    this.loadEvents();
  }

  onToggleUpcoming(onlyUpcoming: boolean): void {
    if (this.aVenir === onlyUpcoming) return;
    this.aVenir = onlyUpcoming;
    this.loadEvents();
  }

  resetFilters(): void {
    this.motCle = '';
    this.lieu = '';
    this.aVenir = true;
    this.loadEvents();
  }

  getMyStatus(eventId: number): InscriptionStatus | null {
    return this.inscriptionsByEvent()[eventId] ?? null;
  }

  isPending(eventId: number): boolean {
    return this.pendingEventIds().has(eventId);
  }

  isPastEvent(event: EventItem): boolean {
    return new Date(event.dateEvenement).getTime() <= Date.now();
  }

  isClosed(event: EventItem): boolean {
    return event.statut !== 'PUBLIE' || this.isPastEvent(event);
  }

  onRegister(event: EventItem): void {
    if (this.isPending(event.id) || this.isClosed(event)) return;

    this.setPending(event.id, true);
    this.feedbackMessage.set(null);

    this.eventService.registerToEvent(event.id).subscribe({
      next: (status) => {
        this.inscriptionsByEvent.update((map) => ({
          ...map,
          [event.id]: status
        }));
        this.refreshEventAndParticipants(event.id);
        this.setPending(event.id, false);

        if (status.statut === 'EN_ATTENTE') {
          this.feedbackMessage.set({
            eventId: event.id,
            type: 'info',
            text: `Ajouté à la file d'attente (rang #${status.rang ?? 1}).`
          });
        } else {
          this.feedbackMessage.set({
            eventId: event.id,
            type: 'success',
            text: 'Inscription confirmée !'
          });
        }
      },
      error: (err) => {
        this.setPending(event.id, false);
        this.feedbackMessage.set({
          eventId: event.id,
          type: 'error',
          text: this.extractErrorMessage(err) || "Impossible de finaliser l'inscription."
        });
      }
    });
  }

  onUnregister(event: EventItem): void {
    if (this.isPending(event.id) || this.isClosed(event)) return;

    this.setPending(event.id, true);
    this.feedbackMessage.set(null);

    this.eventService.unregisterFromEvent(event.id).subscribe({
      next: () => {
        this.inscriptionsByEvent.update((map) => ({
          ...map,
          [event.id]: { statut: 'DESINSCRIT', rang: null }
        }));
        this.refreshEventAndParticipants(event.id);
        this.setPending(event.id, false);
        this.feedbackMessage.set({
          eventId: event.id,
          type: 'info',
          text: 'Désinscription enregistrée.'
        });
      },
      error: (err) => {
        this.setPending(event.id, false);
        this.feedbackMessage.set({
          eventId: event.id,
          type: 'error',
          text: this.extractErrorMessage(err) || 'Impossible de vous désinscrire.'
        });
      }
    });
  }

  toggleParticipants(eventId: number): void {
    const currentlyOpen = this.openParticipantsIds().has(eventId);
    this.openParticipantsIds.update((set) => {
      const next = new Set(set);
      if (currentlyOpen) {
        next.delete(eventId);
      } else {
        next.add(eventId);
      }
      return next;
    });

    if (!currentlyOpen) {
      this.fetchParticipants(eventId);
    }
  }

  isParticipantsOpen(eventId: number): boolean {
    return this.openParticipantsIds().has(eventId);
  }

  isParticipantsLoading(eventId: number): boolean {
    return this.loadingParticipantsIds().has(eventId);
  }

  getParticipants(eventId: number): ParticipantsResponse | null {
    return this.participantsByEvent()[eventId] ?? null;
  }

  getGaugeTone(event: EventItem): 'normal' | 'warning' | 'full' | 'unlimited' {
    if (event.capaciteMax === null) return 'unlimited';
    if (event.complet) return 'full';
    if ((event.tauxRemplissage ?? 0) >= 80) return 'warning';
    return 'normal';
  }

  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return isoDate;
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private loadMyInscriptions(items: EventItem[]): void {
    if (items.length === 0) {
      this.inscriptionsByEvent.set({});
      return;
    }

    const requests = items.map((item) =>
      this.eventService.getMyInscription(item.id).pipe(
        catchError(() => of<InscriptionStatus>({ statut: null, rang: null }))
      )
    );

    forkJoin(requests).subscribe((statuses) => {
      const map: Record<number, InscriptionStatus> = {};
      items.forEach((item, index) => {
        map[item.id] = statuses[index];
      });
      this.inscriptionsByEvent.set(map);
    });
  }

  private refreshEventAndParticipants(eventId: number): void {
    this.eventService.getEventById(eventId).subscribe({
      next: (updated) => {
        this.events.update((list) =>
          list.map((item) => (item.id === eventId ? updated : item))
        );
      }
    });

    if (this.isParticipantsOpen(eventId)) {
      this.fetchParticipants(eventId);
    }
  }

  private fetchParticipants(eventId: number): void {
    this.loadingParticipantsIds.update((set) => new Set(set).add(eventId));

    this.eventService.getParticipants(eventId).subscribe({
      next: (data) => {
        this.participantsByEvent.update((map) => ({
          ...map,
          [eventId]: data
        }));
        this.loadingParticipantsIds.update((set) => {
          const next = new Set(set);
          next.delete(eventId);
          return next;
        });
      },
      error: () => {
        this.loadingParticipantsIds.update((set) => {
          const next = new Set(set);
          next.delete(eventId);
          return next;
        });
      }
    });
  }

  private setPending(eventId: number, pending: boolean): void {
    this.pendingEventIds.update((set) => {
      const next = new Set(set);
      if (pending) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  }

  private extractErrorMessage(err: unknown): string | null {
    const e = err as { error?: unknown; message?: string };
    if (typeof e?.error === 'string' && e.error.trim()) {
      return e.error;
    }
    const obj = e?.error as { message?: string; error?: string } | undefined;
    return obj?.message || obj?.error || null;
  }
}
