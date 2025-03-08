// src/app/features/rooms/waiting-room/waiting-room.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoomService } from '../../../core/services/room.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { WebSocketService } from '../../../core/services/websocket.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-waiting-room',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './waiting-room.component.html',
  styleUrls: ['./waiting-room.component.css']
})
export class WaitingRoomComponent implements OnInit {
  roomId!: number;
  players: any[] = [];
  subscription!: Subscription;
  matchSubscription!: Subscription;


  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private roomService: RoomService,
    private webSocketService: WebSocketService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.joinRoom();
    this.loadRoomUsers();

    // Connect to WebSocket
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.connect(playerId.toString());
    }

    // Listen for match updates
    this.matchSubscription = this.webSocketService.subscribe('/topic/match-updates').subscribe((message: any) => {
      const matchData = message;
      if (matchData.roomId === this.roomId && matchData.players.length === 2) {
        this.router.navigate(['/game', this.roomId]);
      }
    });
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
