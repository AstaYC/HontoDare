// src/app/core/services/game.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private apiUrl = `${environment.apiUrl}/api/game`;

  constructor(private http: HttpClient) {}

  startGame(gameData: {
    roomId: number,
    player1Id: number,
    character1Id?: number,
    player2Id: number,
    character2Id?: number,
    startTime?: Date
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, gameData);
  }

  updateGame(gameId: number, gameData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${gameId}`, gameData);
  }

  endGame(gameId: number, winnerId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${gameId}/end`, { winnerId });
  }

  getGameById(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${gameId}`);
  }

  getGamesByRoomId(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/room/${roomId}`);
  }

  getActiveGameByRoomId(roomId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/room/${roomId}/active`);
  }

  getGamesByPlayerId(playerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/player/${playerId}`);
  }
}
