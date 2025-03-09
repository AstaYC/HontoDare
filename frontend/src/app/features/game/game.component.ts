// src/app/features/game/game.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  roomId!: number;
  gameplayMessages: any[] = [];
  freeChatMessages: any[] = [];
  questionInput: string = '';
  freeChatInput: string = '';
  gameplaySubscription!: Subscription;
  freeChatSubscription!: Subscription;
  matchUpdatesSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);

    // Connect to WebSocket
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.connect(playerId.toString());
    }

    // Subscribe to gameplay chat messages
    this.gameplaySubscription = this.webSocketService.subscribe('/topic/gameplay-chat').subscribe((message: any) => {
      this.gameplayMessages.push(message);
    }, (error: any) => {
      console.error('Gameplay chat subscription failed:', error);
    });

    // Subscribe to free chat messages
    this.freeChatSubscription = this.webSocketService.subscribe('/topic/free-chat').subscribe((message: any) => {
      this.freeChatMessages.push(message);
    }, (error: any) => {
      console.error('Free chat subscription failed:', error);
    });

    // Subscribe to match updates to handle any disconnections or reconnections
    this.matchUpdatesSubscription = this.webSocketService.subscribe('/topic/match-updates').subscribe((message: any) => {
      const matchData = message;
      if (matchData.roomId === this.roomId && matchData.players.length !== 2) {
        console.log('Match no longer valid, redirecting to waiting room...');
        this.webSocketService.disconnect();
        this.router.navigate(['/waiting-room', this.roomId]);
      }
    }, (error: any) => {
      console.error('Match updates subscription failed:', error);
    });
  }

  sendGameplayQuestion() {
    if (this.questionInput.trim()) {
      this.webSocketService.sendMessage(this.questionInput, 'GAMEPLAY_CHAT');
      this.questionInput = '';
    }
  }

  sendFreeChatMessage() {
    if (this.freeChatInput.trim()) {
      this.webSocketService.sendMessage(this.freeChatInput, 'FREE_CHAT');
      this.freeChatInput = '';
    }
  }

  ngOnDestroy() {
    if (this.gameplaySubscription) {
      this.gameplaySubscription.unsubscribe();
    }
    if (this.freeChatSubscription) {
      this.freeChatSubscription.unsubscribe();
    }
    if (this.matchUpdatesSubscription) {
      this.matchUpdatesSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
