import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  EventFilterParams,
  EventItem,
  InscriptionStatus,
  ParticipantsResponse
} from '../../models/event.model';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:8080/api/events';

  getEvents(filters: EventFilterParams = {}): Observable<EventItem[]> {
    let params = new HttpParams();

    if (filters.motCle?.trim()) {
      params = params.set('motCle', filters.motCle.trim());
    }
    if (filters.lieu?.trim()) {
      params = params.set('lieu', filters.lieu.trim());
    }
    if (filters.aVenir !== undefined) {
      params = params.set('aVenir', String(filters.aVenir));
    }

    return this.http.get<EventItem[]>(this.API_URL, { params });
  }

  getEventById(id: number): Observable<EventItem> {
    return this.http.get<EventItem>(`${this.API_URL}/${id}`);
  }

  getMyInscription(eventId: number): Observable<InscriptionStatus> {
    return this.http.get<InscriptionStatus>(`${this.API_URL}/${eventId}/inscriptions/me`);
  }

  registerToEvent(eventId: number): Observable<InscriptionStatus> {
    return this.http.post<InscriptionStatus>(`${this.API_URL}/${eventId}/inscriptions`, {});
  }

  unregisterFromEvent(eventId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${eventId}/inscriptions`);
  }

  getParticipants(eventId: number): Observable<ParticipantsResponse> {
    return this.http.get<ParticipantsResponse>(`${this.API_URL}/${eventId}/inscriptions`);
  }
}
