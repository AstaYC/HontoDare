// src/app/features/rooms/waiting-room/waiting-room.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { RoomService } from '../../../core/services/room.service';
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
export class WaitingRoomComponent implements OnInit {
  roomId!: number;
  players: any[] = [];
  subscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private roomService: RoomService,
    private router: Router
  ) {}

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.loadRoomUsers();
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
    console.log('Attempting to leave room:', this.roomId);
    const playerId = this.authService.getCurrentUserId();
    console.log('Current player ID:', playerId);

    if (playerId) {
      this.roomService.leaveRoom(this.roomId, playerId).subscribe({
        next: (response) => {
          console.log('Left room successfully. Response:', response);
          this.router.navigate(['/rooms']);
        },
        error: (err) => {
          console.error('Failed to leave room. Error details:', err);
          // You might want to show an error message to the user
        }
      });
    } else {
      console.error('Cannot leave room: Player ID is not available');
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
