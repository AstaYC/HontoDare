// src/app/features/game/game.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../../core/services/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../../core/services/room.service';

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
  playerId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private roomService: RoomService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    const userId = this.authService.getCurrentUserId();

    if (userId) {
      this.playerId = userId.toString();
      console.log('Player ID:', this.playerId);
      console.log('Room ID:', this.roomId);

      this.webSocketService.connect(this.playerId, this.roomId).then(() => {
        console.log('Connected to WebSocket for game');

// Subscribe to room-specific gameplay chat
        this.gameplaySubscription = this.webSocketService
          .subscribe(`/topic/room/${this.roomId}/gameplay`)
          .subscribe({
            next: (message: any) => {
              console.log('Received gameplay message:', message);

              // Check if this message already exists in the array
              const isDuplicate = this.gameplayMessages.some(m =>
                m.sender === message.sender &&
                m.content === message.content &&
                m.type === message.type
              );

              if (!isDuplicate) {
                this.gameplayMessages.push(message);
              }
            },
            error: (error) => console.error('Gameplay subscription error:', error)
          });

// Subscribe to room-specific free chat
        this.freeChatSubscription = this.webSocketService
          .subscribe(`/topic/room/${this.roomId}/free`)
          .subscribe({
            next: (message: any) => {
              console.log('Received free chat message:', message);

              // Check if this message already exists in the array
              const isDuplicate = this.freeChatMessages.some(m =>
                m.sender === message.sender &&
                m.content === message.content &&
                m.type === message.type
              );

              if (!isDuplicate) {
                this.freeChatMessages.push(message);
              }
            },
            error: (error) => console.error('Free chat subscription error:', error)
          });

        // Also subscribe to general room updates
        this.matchUpdatesSubscription = this.webSocketService
          .subscribeToRoom(this.roomId)
          .subscribe({
            next: (message: any) => {
              console.log('Game room update received:', message);

              if (message.type === 'PLAYER_LEFT') {
                alert('Your opponent has left the game');
              }
            },
            error: (error) => console.error('Room updates subscription error:', error)
          });

      }).catch(error => {
        console.error('Failed to connect to WebSocket:', error);

        // if (error === 'User already connected to this room') {
        //   alert('You are already connected to this game in another window or tab.');
        //   this.router.navigate(['/rooms']);
        //   return;
        // }
      });

    } else {
      console.error('No user ID available');
      this.router.navigate(['/login']);
    }
  }

  sendGameplayQuestion() {
    console.log('Sending gameplay question:', this.questionInput);
    if (this.questionInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(
        this.questionInput,
        'GAMEPLAY_CHAT',
        this.playerId,
        this.roomId
      );
      // // Add the message locally for immediate feedback
      // this.gameplayMessages.push({
      //   sender: this.playerId,
      //   content: this.questionInput,
      //   type: 'GAMEPLAY_CHAT'
      // });
      this.questionInput = '';
    }
  }

  sendFreeChatMessage() {
    console.log('Sending free chat message:', this.freeChatInput);
    if (this.freeChatInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(
        this.freeChatInput,
        'FREE_CHAT',
        this.playerId,
        this.roomId
      );
      // Add the message locally for immediate feedback
      // this.freeChatMessages.push({
      //   sender: this.playerId,
      //   content: this.freeChatInput,
      //   type: 'FREE_CHAT'
      // });
      this.freeChatInput = '';
    }
  }

  leaveGame() {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      // Send WebSocket message first
      this.webSocketService.sendLeaveRoomMessage(this.roomId, playerId.toString());

        this.roomService.leaveRoom(this.roomId, playerId).subscribe({
        next: () => {
          console.log('Left room:', this.roomId);
          this.webSocketService.disconnect();
          this.router.navigate(['/rooms']);
        },
        error: (err) => console.error('Failed to leave room:', err)
      });
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

    // Ensure we disconnect from WebSocket
    this.webSocketService.disconnect();
  }
}
