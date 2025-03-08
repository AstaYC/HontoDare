// src/app/core/services/websocket.service.ts
import { Injectable } from '@angular/core';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private stompClient: any;
  private username: string | null = null;

  // Subjects for message streams
  private messageSubjects: Map<string, Subject<any>> = new Map();

  constructor() {}

  connect(username: string): void {
    this.username = username;
    const socket = new SockJS(`${environment.apiUrl}/ws`);
    this.stompClient = Stomp.over(socket);

    this.stompClient.connect({}, () => {
      console.log('Connected to WebSocket');

      // Subscribe to public chat topic
      this.subscribeToTopic('/topic/public');

      // Subscribe to gameplay chat topic
      this.subscribeToTopic('/topic/gameplay-chat');

      // Subscribe to free chat topic
      this.subscribeToTopic('/topic/free-chat');
    });

    // Notify server that user has joined
    this.sendMessage('', 'JOIN');
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

      // Subscribe to the topic using STOMP
      this.stompClient.subscribe(topic, (message: any) => {
        const parsedMessage = JSON.parse(message.body);
        subject.next(parsedMessage);
      });
    }

    return this.messageSubjects.get(topic)!;
  }

  private subscribeToTopic(topic: string): void {
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
