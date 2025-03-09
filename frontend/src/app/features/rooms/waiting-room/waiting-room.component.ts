// src/app/features/rooms/waiting-room/waiting-room.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoomService } from '../../../core/services/room.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subscription } from 'rxjs';
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

  constructor(
      private route: ActivatedRoute,
      private authService: AuthService,
      private roomService: RoomService,
      private webSocketService: WebSocketService,
      private router: Router
  ) {}

// src/app/features/rooms/waiting-room/waiting-room.component.ts
  async ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.loadRoomUsers();

    // Connect to WebSocket with roomId
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      try {
        // Connect to WebSocket and wait for it to complete
        await this.webSocketService.connect(playerId.toString(), this.roomId);
        console.log('WebSocket connected successfully');

        // Subscribe to room updates
        this.matchSubscription = this.webSocketService
            .subscribeToRoom(this.roomId)
            .subscribe((message: any) => {
              console.log('Room update received:', message);

              if (message.type === 'MATCH_CREATED') {
                console.log('Match created, navigating to game');
                this.router.navigate(['/game', this.roomId]);
              } else if (message.type === 'PLAYER_JOINED') {
                this.loadRoomUsers();
              }
            });

      } catch (err) {
        console.error('Failed to connect to WebSocket:', err);
      }
    }
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
      next: (users) => this.players = users,
      error: (err) => console.error('Failed to load room users:', err)
    });
  }

  leaveRoom() {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
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
    if (this.matchSubscription) {
      this.matchSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
