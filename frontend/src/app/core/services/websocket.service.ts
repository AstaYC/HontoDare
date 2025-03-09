// src/app/core/services/websocket.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Subject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private username: string | null = null;
  private isBrowser: boolean;
  private Stomp: any;
  private SockJS: any;

  // Subjects for message streams
  private messageSubjects: Map<string, Subject<any>> = new Map();

  constructor(@Inject(PLATFORM_ID) private platformId: any) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      // Load libraries synchronously to avoid race conditions
      Promise.all([
        import('@stomp/stompjs'),
        import('sockjs-client')
      ]).then(([stompModule, sockJSModule]) => {
        this.Stomp = stompModule.Stomp;
        this.SockJS = sockJSModule.default;
        console.log('Both WebSocket libraries loaded successfully');
      }).catch(err => {
        console.error('Failed to load WebSocket libraries:', err);
      });
    }
  }

  connect(username: string, roomId?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        console.log('WebSocket not available in non-browser environment');
        reject('Not in browser');
        return;
      }

      // Set a timeout for library loading
      let libraryTimeout: any = null;
      let attempts = 0;

      const waitForLibraries = async (): Promise<void> => {
        attempts++;

        if (attempts > 50) { // Try for ~5 seconds max
          clearTimeout(libraryTimeout);
          reject('Timed out waiting for WebSocket libraries to load');
          return;
        }

        if (!this.Stomp || !this.SockJS) {
          console.log(`Waiting for WebSocket libraries to load... (attempt ${attempts})`);
          libraryTimeout = setTimeout(waitForLibraries, 100);
          return;
        }

        clearTimeout(libraryTimeout);

        try {
          this.username = username;
          const socket = new this.SockJS(`${environment.apiUrl}/ws`);
          this.stompClient = this.Stomp.over(socket);

          this.stompClient.connect({}, () => {
            console.log('Connected to WebSocket');

            // Subscribe to general topics
            this.subscribeToTopic('/topic/public');
            this.subscribeToTopic('/topic/match-updates');

            // Subscribe to room-specific topic if roomId is provided
            if (roomId) {
              this.subscribeToTopic(`/topic/room/${roomId}`);
            }

            // Notify server that user has joined
            if (roomId) {
              this.sendJoinRoomMessage(roomId, username);
            } else {
              this.sendMessage('', 'JOIN');
            }

            // Resolve the promise now that we're connected
            resolve();
          }, (error: any) => {
            console.error('WebSocket connection failed:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Error establishing WebSocket connection:', error);
          reject(error);
        }
      };

      waitForLibraries();
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
  subscribeToRoom(roomId: number): Subject<any> {
    const topic = `/topic/room/${roomId}`;

    if (!this.messageSubjects.has(topic)) {
      const subject = new Subject<any>();
      this.messageSubjects.set(topic, subject);
    }

    // Return the subject immediately, it will receive messages
    // once the connection completes in the connect() method
    return this.messageSubjects.get(topic)!;
  }

  sendMessage(content: string, type: string): void {
    if (this.stompClient && this.username) {
      const chatMessage = { sender: this.username, content, type };
      this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
    }
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect();
      console.log('Disconnected from WebSocket');
    }
  }

  subscribe(topic: string): Subject<any> {
    if (!this.messageSubjects.has(topic)) {
      const subject = new Subject<any>();
      this.messageSubjects.set(topic, subject);

      // Only subscribe if client is available
      if (this.stompClient) {
        this.subscribeToClient(topic, subject);
      } else {
        console.log(`StompClient not available for topic ${topic}`);
      }
    }

    return this.messageSubjects.get(topic)!;
  }

  private subscribeToClient(topic: string, subject: Subject<any>): void {
    if (!this.stompClient) return;

    this.stompClient.subscribe(topic, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      console.log(`Received message on topic ${topic}:`, parsedMessage);
      subject.next(parsedMessage);
    }, (error: any) => {
      console.error(`Subscription to topic ${topic} failed:`, error);
    });
  }

  private subscribeToTopic(topic: string): void {
    if (!this.stompClient) return;

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
}
