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
    this.isBrowser = isPlatformBrowser(platformId);

    // Only load these libraries in browser context
    if (this.isBrowser) {
      // Use dynamic imports to avoid SSR issues
      import('@stomp/stompjs').then(stompModule => {
        this.Stomp = stompModule.Stomp;
      });

      import('sockjs-client').then(sockJSModule => {
        this.SockJS = sockJSModule.default;
      });
    }
  }

  connect(username: string): void {
    if (!this.isBrowser || !this.Stomp || !this.SockJS) {
      console.log('WebSocket not available in this environment or libraries not loaded yet');
      return;
    }

    this.username = username;
    const socket = new this.SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = this.Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');

      // Subscribe to public chat topic
      this.subscribeToTopic('/topic/public');

      // Subscribe to gameplay chat topic
      this.subscribeToTopic('/topic/gameplay-chat');

      // Subscribe to free chat topic
      this.subscribeToTopic('/topic/free-chat');

      // Notify server that user has joined
      this.sendMessage('', 'JOIN');
    });
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
      }
    }

    return this.messageSubjects.get(topic)!;
  }

  private subscribeToClient(topic: string, subject: Subject<any>): void {
    this.stompClient.subscribe(topic, (message: any) => {
      const parsedMessage = JSON.parse(message.body);
      subject.next(parsedMessage);
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
