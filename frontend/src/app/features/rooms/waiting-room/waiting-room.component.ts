// src/app/features/rooms/waiting-room/waiting-room.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoomService } from '../../../core/services/room.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription, interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit, OnDestroy {
  roomId!: number;
  players: any[] = [];
  matchSubscription!: Subscription;
  roomSubscription!: Subscription;
  timerSubscription!: Subscription;
  waitingTime = 0; // Time in seconds

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private roomService: RoomService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.loadRoomUsers();
    this.startWaitingTimer();

    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.connect(playerId.toString(), this.roomId).then(() => {
        console.log('WebSocket connection established');

        this.roomSubscription = this.webSocketService
          .subscribeToRoom(this.roomId)
          .subscribe((message: any) => {
            console.log('Room message received:', message);

            if (message.type === 'PLAYER_JOINED') {
              console.log('Player joined:', message.playerId);
              this.loadRoomUsers();
            } else if (message.type === 'PLAYER_LEFT') {
              console.log('Player left:', message.playerId);
              this.loadRoomUsers();
            } else if (message.type === 'MATCH_CREATED') {
              console.log('Match created, redirecting to character upload');
              this.router.navigate(['/character-upload', this.roomId]);
            }
          });

        this.webSocketService.sendJoinRoomMessage(this.roomId, playerId.toString());
      }).catch((error: any) => {
        console.error('WebSocket connection failed:', error);
      });
    }
  }

  startWaitingTimer() {
    this.timerSubscription = interval(1000)
      .subscribe(() => {
        this.waitingTime++;
      });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  joinRoom() {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.roomService.joinRoom(this.roomId, playerId).subscribe({
        next: () => {
          console.log('Joined room:', this.roomId);
        },
        error: (err) => console.error('Failed to join room:', err)
      });
    }
  }

  loadRoomUsers() {
    this.roomService.getRoomUsers(this.roomId).subscribe({
      next: (users) => {
        this.players = users;
        console.log('Loaded room users:', this.players);
      },
      error: (err) => console.error('Failed to load room users:', err)
    });
  }

  leaveRoom() {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.sendLeaveRoomMessage(this.roomId, playerId.toString());

      this.roomService.leaveRoom(this.roomId, playerId).subscribe({
        next: () => {
          this.webSocketService.disconnect();
          this.router.navigate(['/rooms']);
        },
        error: (err) => console.error('Failed to leave room:', err)
      });
    }
  }

  ngOnDestroy() {
    if (this.matchSubscription) {
      this.matchSubscription.unsubscribe();
    }
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  getPlayerDisplayName(player: any): string {
    const currentUserId = this.authService.getCurrentUserId();
    if (player.userId === currentUserId) {
      return localStorage.getItem('username') || localStorage.getItem('name') ||
        player.username || player.name || `Player ${player.userId}`;
    }

    return player.username || player.name || `Player ${player.userId}`;
  }

  getPlayerInitial(player: any): string {
    const displayName = this.getPlayerDisplayName(player);
    return displayName.charAt(0).toUpperCase();
  }
}
