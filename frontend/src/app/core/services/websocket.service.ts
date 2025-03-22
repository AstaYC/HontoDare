// src/app/core/services/websocket.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { WebSocketSubject } from 'rxjs/webSocket';
import { webSocket } from 'rxjs/webSocket';
import { Observable } from 'rxjs';


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




  // Subjects for message streams
  private messageSubjects: Map<string, Subject<any>> = new Map();

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Add polyfill for global to fix "global is not defined" error
      (window as any).global = window;

      // Load libraries immediately on service initialization
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
          this.connected = true;
          this.subscribeToTopic('/topic/public');
          this.subscribeToTopic('/topic/match-updates');
          if (roomId) {
            this.subscribeToTopic(`/topic/room/${roomId}`);
            this.sendJoinRoomMessage(roomId, username);
          }
          resolve();
        }, (error: any) => {
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

  sendMessage(content: string, type: string): void {
    if (this.stompClient && this.username) {
      const chatMessage = { sender: this.username, content, type };
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    }
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
    if (!this.messageSubjects.has(topic)) {
      const subject = new Subject<any>();
      this.messageSubjects.set(topic, subject);

      // Only subscribe if client is available and connected
      if (this.stompClient && this.stompClient.connected) {
        this.subscribeToClient(topic, subject);
      } else {
        console.log(`StompClient not available for topic ${topic}`);
      }
    }

    return this.messageSubjects.get(topic)!;
  }

  private subscribeToClient(topic: string, subject: Subject<any>): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(topic, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      console.log(`Received message on topic ${topic}:`, parsedMessage);
      subject.next(parsedMessage);
    }, (error: any) => {
      console.error(`Subscription to topic ${topic} failed:`, error);
    });
  }

  private subscribeToTopic(topic: string): void {
    if (!this.stompClient || !this.stompClient.connected) return;

    this.stompClient.subscribe(topic, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      console.log(`Received message on topic ${topic}:`, parsedMessage);

      // Emit the message to the corresponding subject
      const subject = this.messageSubjects.get(topic);
      if (subject) {
        subject.next(parsedMessage);
      }
    });
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
      uploads.add(playerId);

      // Check if both players have uploaded
      if (uploads.size === 2) {
        // Get all players who have uploaded
        const players = Array.from(uploads);

        // Send a message indicating all players have uploaded
        await this.sendChatMessage(
          JSON.stringify({
            message: 'All players have uploaded characters',
            players: players
          }),
          'ALL_PLAYERS_UPLOADED',
          playerId,
          roomId
        );
        console.log('Sent ALL_PLAYERS_UPLOADED message with players:', players);


        // This is where the new code should go - initialize the game
        // Get the opponent ID from the players array
        const currentUserId = playerId;
        const opponentId = players.find(id => id !== currentUserId);

        if (opponentId && currentUserId) {
          // Initialize a new game in the database
          this.trackGameStart(roomId, currentUserId, opponentId)
            .then(() => {
              console.log('Game initialized successfully');
              // Continue with game start logic
            })
            .catch(error => {
              console.error('Failed to initialize game:', error);
            });
        }

        console.log('Sent ALL_PLAYERS_UPLOADED message');
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

  getUploadCount(roomId: number): number {
    return this.characterUploads.get(roomId)?.size || 0;
  }

  clearUploads(roomId: number) {
    this.characterUploads.delete(roomId);
  }


  trackGameStart(roomId: number, player1Id: string, player2Id: string): Promise<void> {
    return new Promise((resolve, reject) => {

      const gameData = {
        roomId: roomId,
        player1Id: Number(player1Id),
        player2Id: Number(player2Id),
        startTime: new Date().toISOString()
      };

      console.log('Sending game data:', gameData);  // Debug log

      this.http.post(`${this.apiUrl}/api/game/start`, gameData)
        .subscribe({
          next: (response) => {
            console.log('Game started successfully:', response);
            localStorage.setItem(`game_${roomId}`, JSON.stringify(response));
            resolve();
          },
          error: (error) => {
            console.error('Failed to initialize game:', error);
            reject(error);
          }
        });
    });
  }
}
