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

  // Start a new game with the given room and player information
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

  // Update an existing game with new information
  updateGame(gameId: number, gameData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${gameId}`, gameData);
  }

  // End a game and record the winner
  endGame(gameId: number, winnerId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${gameId}/end`, { winnerId });
  }

  // Get a specific game by ID
  getGameById(gameId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${gameId}`);
  }

  // Get all games associated with a room
  getGamesByRoomId(roomId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/room/${roomId}`);
  }

  // Get active game for a specific room
  getActiveGameByRoomId(roomId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/room/${roomId}/active`);
  }

  // Get all games for a specific player
  getGamesByPlayerId(playerId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/player/${playerId}`);
  }
}
