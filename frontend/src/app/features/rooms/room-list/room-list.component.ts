// src/app/features/rooms/room-list/room-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  rooms: any[] = [];

  constructor(private roomService: RoomService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.roomService.getRooms().subscribe({
      next: (rooms) => this.rooms = rooms,
      error: (err) => console.error('Failed to load rooms:', err)
    });
  }

  joinRoom(roomId: number) {
    const playerId = this.authService.getCurrentUser()?.id;
    if (playerId) {
      this.roomService.joinRoom(roomId, playerId).subscribe({
        next: (response) => {
          console.log('Joined room:', response);
          this.router.navigate(['/waiting-room', roomId]);
        },
        error: (err) => console.error('Failed to join room:', err)
      });
    }
  }
}
