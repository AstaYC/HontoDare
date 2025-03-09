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
  roomSubscription!: Subscription;

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

    // Connect to WebSocket
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.connect(playerId.toString(), this.roomId).then(() => {
        console.log('WebSocket connection established');

        // Single subscription - use subscribeToRoom
        this.roomSubscription = this.webSocketService
          .subscribeToRoom(this.roomId)
          .subscribe((message: any) => {
            console.log('Room update received:', message);

            if (message.type === 'MATCH_CREATED') {
              console.log('Match created, navigating to game');
              this.router.navigate(['/game', this.roomId]);
            } else if (message.type === 'PLAYER_JOINED') {
              console.log('Player joined:', message.playerId);
              this.loadRoomUsers();
            }
          });

        // Join the room
        this.webSocketService.sendJoinRoomMessage(this.roomId, playerId.toString());
      }).catch((error: any) => {
        console.error('WebSocket connection failed:', error);
      });
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
      // Send WebSocket message first
      this.webSocketService.sendLeaveRoomMessage(this.roomId, playerId.toString());

      // Then call the REST API
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
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }
}
