// src/app/core/services/room.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/rooms`);
  }

  getRoomsByCategory(category: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/rooms/category/${category}`);
  }

  joinRoom(roomId: number, playerId: number): Observable<any> {
    const headers = new HttpHeaders({ 'userId': playerId.toString() });
    return this.http.post<void>(`${this.apiUrl}/api/waiting/${roomId}/join`, {}, { headers });
  }

  leaveRoom(roomId: number, playerId: number): Observable<any> {
    const headers = new HttpHeaders({ 'userId': playerId.toString() });
    return this.http.post<void>(`${this.apiUrl}/api/waiting/${roomId}/leave`, {}, { headers });
  }

  getRoomUsers(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/waiting/${roomId}/users`);
  }
}
