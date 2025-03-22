// src/app/features/game/game.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
export class GameComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('gameplayChat') gameplayChatElement!: ElementRef;
  @ViewChild('freeChat') freeChatElement!: ElementRef;

  roomId!: number;
  gameplayMessages: any[] = [];
  freeChatMessages: any[] = [];
  questionInput: string = '';
  freeChatInput: string = '';
  gameplaySubscription!: Subscription;
  freeChatSubscription!: Subscription;
  matchUpdatesSubscription!: Subscription;
  playerId: string | null = null;
  playerName: string = '';
  opponentName: string = 'Opponent';
  opponentId: string | null = null;

  // Character information - using placeholders instead of service
  myCharacter: any = { name: 'YOUR CHARACTER' };
  opponentCharacter: any = { name: 'MYSTERY CHARACTER' };

  // Yes/No validation
  yesNoRegex = /^(yes|no|maybe)$/i;
  invalidYesNoMessage: boolean = false;

  // Game state
  isGuessing: boolean = false;
  guessInput: string = '';

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
    this.playerName = this.authService.getCurrentUser()?.username || 'Player';

    if (userId) {
      this.playerId = userId.toString();
      console.log('Player ID:', this.playerId);
      console.log('Room ID:', this.roomId);

      // Get room information to find opponent
      this.getRoomInfo();

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
                // Add sender name if available
                if (message.sender === this.playerId) {
                  message.senderName = this.playerName;
                } else if (this.opponentId && message.sender === this.opponentId) {
                  message.senderName = this.opponentName;
                } else {
                  message.senderName = 'Opponent';
                }

                this.gameplayMessages.push(message);
                this.scrollToBottom('gameplay');
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
                // Add sender name if available
                if (message.sender === this.playerId) {
                  message.senderName = this.playerName;
                } else if (this.opponentId && message.sender === this.opponentId) {
                  message.senderName = this.opponentName;
                } else {
                  message.senderName = 'Opponent';
                }

                this.freeChatMessages.push(message);
                this.scrollToBottom('free');
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
              } else if (message.type === 'GUESS_CORRECT') {
                // Handle correct guess
                alert('Correct guess! Game over.');
                // Navigate to results page or show winner
              }
            },
            error: (error) => console.error('Room updates subscription error:', error)
          });

      }).catch(error => {
        console.error('Failed to connect to WebSocket:', error);
      });

    } else {
      console.error('No user ID available');
      this.router.navigate(['/login']);
    }
  }

  getRoomInfo() {
    // Use the existing roomService to get information about the room
    // This replaces the character service functionality
    if (this.roomService.getRoomUsers) {
      this.roomService.getRoomUsers(this.roomId).subscribe({
        next: (users) => {
          console.log('Room users:', users);

          // Find opponent (any user that's not the current player)
          const opponent = users.find(u => u.userId.toString() !== this.playerId);
          if (opponent) {
            this.opponentId = opponent.userId.toString();
            this.opponentName = opponent.username || opponent.name || 'Opponent';
          }
        },
        error: (err) => console.error('Failed to get room users:', err)
      });
    }
  }

  sendGameplayQuestion() {
    if (this.questionInput.trim() && this.playerId) {
      // Check if it's a valid yes/no question (this is just a basic check)
      if (!this.questionInput.trim().endsWith('?')) {
        this.invalidYesNoMessage = true;
        setTimeout(() => this.invalidYesNoMessage = false, 3000);
        return;
      }

      this.webSocketService.sendChatMessage(
        this.questionInput,
        'GAMEPLAY_CHAT',
        this.playerId,
        this.roomId
      );

      this.questionInput = '';
    }
  }

  sendFreeChatMessage() {
    if (this.freeChatInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(
        this.freeChatInput,
        'FREE_CHAT',
        this.playerId,
        this.roomId
      );

      this.freeChatInput = '';
    }
  }

  sendYesNoAnswer(answer: 'yes' | 'no' | 'maybe') {
    if (this.playerId) {
      this.webSocketService.sendChatMessage(
        answer,
        'GAMEPLAY_CHAT',
        this.playerId,
        this.roomId
      );
    }
  }

  makeGuess() {
    if (this.guessInput.trim() && this.playerId) {
      this.webSocketService.sendChatMessage(
        `GUESS: ${this.guessInput}`,
        'GAME_STATE',
        this.playerId,
        this.roomId
      );

      // Also send as a gameplay message for visibility
      this.webSocketService.sendChatMessage(
        `I guess the character is: ${this.guessInput}`,
        'GAMEPLAY_CHAT',
        this.playerId,
        this.roomId
      );

      this.guessInput = '';
      this.isGuessing = false;
    }
  }

  toggleGuessMode() {
    this.isGuessing = !this.isGuessing;
  }

  leaveGame() {
    if (confirm('Are you sure you want to leave the game?')) {
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
  }

  scrollToBottom(chatType: 'gameplay' | 'free') {
    setTimeout(() => {
      if (chatType === 'gameplay' && this.gameplayChatElement) {
        this.gameplayChatElement.nativeElement.scrollTop =
          this.gameplayChatElement.nativeElement.scrollHeight;
      } else if (chatType === 'free' && this.freeChatElement) {
        this.freeChatElement.nativeElement.scrollTop =
          this.freeChatElement.nativeElement.scrollHeight;
      }
    }, 100);
  }

  ngAfterViewChecked() {
    this.scrollToBottom('gameplay');
    this.scrollToBottom('free');
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

  // Helper method to get initials for avatar
  getInitials(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  // Helper to get random color based on user ID (for consistent colors)
  getAvatarColor(userId: string): string {
    const colors = [
      'from-red-600 to-red-800',
      'from-blue-600 to-blue-800',
      'from-green-600 to-green-800',
      'from-purple-600 to-purple-800',
      'from-yellow-600 to-yellow-800',
      'from-pink-600 to-pink-800'
    ];

    // Simple hash function to get consistent color
    const hash = userId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    return colors[hash % colors.length];
  }
}
