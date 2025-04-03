// src/app/core/services/websocket.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

import { GameService } from './game.service';



@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private username: string | null = null;
  private isBrowser: boolean;
  private Stomp: any;
  private SockJS: any;
  private librariesLoaded = false;
  private librariesLoadingPromise: Promise<void> | null = null;
  private activeConnectionsByUser: Map<string, Set<number>> = new Map();
  private characterUploads: Map<number, Set<string>> = new Map();
  private connected: boolean = false;
  private apiUrl = environment.apiUrl;


  private messageSubjects: Map<string, Subject<any>> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient,
    private gameService: GameService

  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      (window as any).global = window;

      this.librariesLoadingPromise = this.loadWebSocketLibraries();
    }
  }

  private loadWebSocketLibraries(): Promise<void> {
    return new Promise((resolve, reject) => {
      Promise.all([
        import('@stomp/stompjs'),
        import('sockjs-client')
      ]).then(([stompModule, sockJSModule]) => {
        this.Stomp = stompModule.Stomp;
        this.SockJS = sockJSModule.default;
        this.librariesLoaded = true;
        console.log('Both WebSocket libraries loaded successfully');
        resolve();
      }).catch(err => {
        console.error('Failed to load WebSocket libraries:', err);
        reject(err);
      });
    });
  }

  async connect(username: string, roomId?: number): Promise<void> {
    if (!this.isBrowser) {
      return Promise.reject('Not in browser');
    }

    if (this.stompClient?.connected) {
      return Promise.resolve();
    }

    if (!this.librariesLoaded) {
      try {
        await Promise.race([
          this.librariesLoadingPromise,
          new Promise((_, reject) => setTimeout(() => reject('Timed out waiting for WebSocket libraries to load'), 10000))
        ]);
      } catch (error) {
        return Promise.reject(error);
      }
    }

    return new Promise((resolve, reject) => {
      try {
        this.username = username;
        const socket = new this.SockJS(`${environment.apiUrl}/ws`);
        this.stompClient = this.Stomp.over(socket);
        this.stompClient.debug = () => {};

        this.stompClient.connect({}, () => {
          console.log('Connected to WebSocket');
          this.connected = true;

          if (roomId) {
            if (!this.activeConnectionsByUser.has(username)) {
              this.activeConnectionsByUser.set(username, new Set());
            }
            this.activeConnectionsByUser.get(username)!.add(roomId);
          }

          // Subscribe to any pending topics
          this.messageSubjects.forEach((subject, topic) => {
            this.subscribeToClient(topic, subject);
          });

          resolve();
        }, (error: any) => {
          console.error('WebSocket connection error:', error);
          this.connected = false;
          reject(error);
        });
      } catch (error) {
        this.connected = false;
        reject(error);
      }
    });
  }
  sendJoinRoomMessage(roomId: number, playerId: string): void {
    if (this.stompClient) {
      const joinMessage = {
        roomId: roomId,
        playerId: playerId,
        type: 'ROOM_JOIN'
      };
      this.stompClient.send('/app/room.join', {}, JSON.stringify(joinMessage));
      console.log(`Sent join message for room ${roomId}`);
    }
  }

  sendLeaveRoomMessage(roomId: number, playerId: string): void {
    if (this.stompClient) {
      const leaveMessage = {
        roomId: roomId,
        playerId: playerId,
        type: 'ROOM_LEAVE'
      };
      this.stompClient.send('/app/room.leave', {}, JSON.stringify(leaveMessage));
      console.log(`Sent leave message for room ${roomId}`);
    }
  }

  subscribeToRoom(roomId: number): Subject<any> {
    const topic = `/topic/room/${roomId}`;

    if (!this.messageSubjects.has(topic)) {
      const subject = new Subject<any>();
      this.messageSubjects.set(topic, subject);

      // If already connected, subscribe immediately
      if (this.stompClient && this.stompClient.connected) {
        this.subscribeToClient(topic, subject);
      }
    }

    return this.messageSubjects.get(topic)!;
  }


  disconnect(): void {
    if (this.stompClient && this.stompClient.connected) {
      // Remove tracking for this user/room
      // if (this.username) {
      //   const userRooms = this.activeConnectionsByUser.get(this.username);
      //   if (userRooms) {
      //     // Remove all room associations for this user
      //     this.activeConnectionsByUser.delete(this.username);
      //     console.log(`Removed connection tracking for user ${this.username}`);
      //   }
      // }

      this.stompClient.disconnect();
      console.log('Disconnected from WebSocket');
    }
  }

  subscribe(topic: string): Subject<any> {
    // Check if we already have a subject for this topic
    if (!this.messageSubjects.has(topic)) {
      const subject = new Subject<any>();
      this.messageSubjects.set(topic, subject);

      // Only subscribe if client is available and connected
      if (this.stompClient && this.stompClient.connected) {
        this.subscribeToClient(topic, subject);
      } else {
        console.log(`StompClient not available for topic ${topic}, will subscribe when connected`);
      }
    }

    return this.messageSubjects.get(topic)!;
  }

  private subscribeToClient(topic: string, subject: Subject<any>): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    const subscription = this.stompClient.subscribe(topic, (message: any) => {
      try {
        const parsedMessage = JSON.parse(message.body);
        console.log(`Received message on topic ${topic}:`, parsedMessage);
        subject.next(parsedMessage);
      } catch (error) {
        console.error(`Error parsing message on topic ${topic}:`, error);
      }
    });

    console.log(`Successfully subscribed to topic ${topic}`);
  }

  // sendChatMessage(content: string, type: string, sender: string, roomId?: number): void {
  //   if (this.stompClient) {
  //     const chatMessage = {
  //       sender: sender,
  //       content: content,
  //       type: type,
  //       roomId: roomId
  //     };
  //     this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
  //     console.log(`Sent ${type} message to room ${roomId}`);
  //   }
  // }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  async sendChatMessage(content: string, type: string, sender: string, roomId?: number): Promise<void> {
    if (!this.isConnected()) {
      try {
        await this.connect(sender, roomId);
      } catch (error) {
        console.error('Failed to reconnect:', error);
        throw error;
      }
    }

    const chatMessage = {
      sender: sender,
      content: content,
      type: type,
      roomId: roomId
    };

    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    console.log(`Sent ${type} message to room ${roomId}`);
  }

  async trackCharacterUpload(roomId: number, playerId: string) {
    try {
      await this.ensureConnection(playerId, roomId);

      if (!this.characterUploads.has(roomId)) {
        this.characterUploads.set(roomId, new Set());
      }
      const uploads = this.characterUploads.get(roomId)!;
      console.log(`Adding player ${playerId} to uploads for room ${roomId}`);
      if (!playerId) {
        console.error('Attempting to add undefined/null playerId to uploads');
      }
      uploads.add(playerId);

      console.log(`Player ${playerId} uploaded character for room ${roomId}`);
      console.log(`Current uploads for room ${roomId}:`, Array.from(uploads));

      // Check if both players have uploaded
      if (uploads.size === 2) {
        // Get all players who have uploaded
        const players = Array.from(uploads);
        console.log(`All ${players.length} players have uploaded characters:`, players);

        // Send a message with players array in JSON format
        const messageContent = {
          message: 'All players have uploaded characters',
          players: players
        };

        await this.sendChatMessage(
          JSON.stringify(messageContent),
          'ALL_PLAYERS_UPLOADED',
          playerId,
          roomId
        );

        console.log('Sent ALL_PLAYERS_UPLOADED message with message content:', messageContent);
      }
    } catch (error) {
      console.error('Error in trackCharacterUpload:', error);
      throw error;
    }
  }

  private async ensureConnection(username: string, roomId?: number): Promise<void> {
    if (!this.isConnected()) {
      await this.connect(username, roomId);
    }
  }


  clearUploads(roomId: number) {
    this.characterUploads.delete(roomId);
  }


  // Modify completeGame method to handle both scenarios
  async completeGame(roomId: number, winnerId: string, loserId: string): Promise<any> {
    try {
      console.log(`Completing game - Room: ${roomId}, Winner: ${winnerId}, Loser: ${loserId}`);

      // Get character IDs from localStorage
      const winnerCharacterId = localStorage.getItem(`character_${roomId}_${winnerId}`);
      const loserCharacterId = localStorage.getItem(`character_${roomId}_${loserId}`);

      console.log(`Character IDs - Winner: ${winnerCharacterId}, Loser: ${loserCharacterId}`);

      // Create game data
      const gameData = {
        roomId: Number(roomId),
        player1Id: Number(winnerId),
        player2Id: Number(loserId),
        character1Id: winnerCharacterId ? Number(winnerCharacterId) : null,
        character2Id: loserCharacterId ? Number(loserCharacterId) : null,
        startTime: new Date(),
        endTime: new Date(),
        gameMode: "PvsP",
        winnerId: Number(winnerId)
      };

      console.log('Sending game completion data:', gameData);

      return new Promise((resolve, reject) => {
        this.http.post<any>(`${this.apiUrl}/api/game/complete`, gameData).subscribe({
          next: (response) => {
            console.log('Game completion successful:', response);
            resolve(response);
          },
          error: (error) => {
            console.error('Game completion API error:', error);
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error in completeGame:', error);
      return Promise.reject(error);
    }
  }

}
