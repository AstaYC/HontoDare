// src/app/features/rooms/room-list/room-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomService } from '../../../core/services/room.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {NavbarComponent} from "../../../shared/navbar/navbar.component";
import {FooterComponent} from "../../../shared/footer/footer.component";

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, FooterComponent],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomListComponent implements OnInit {
  rooms: any[] = [];
  isLoading = true;

  constructor(private roomService: RoomService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.loadRooms();
  }

  loadRooms() {
    this.isLoading = true;
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load rooms:', err);
        this.isLoading = false;
      }
    });
  }

  joinRoom(roomId: number) {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.roomService.joinRoom(roomId, playerId).subscribe({
        next: () => {
          console.log('Joined room:', roomId);
          this.router.navigate(['/waiting-room', roomId]);
        },
        error: (err) => console.error('Failed to join room:', err)
      });
    } else {
      console.error('Player ID not found');
      this.router.navigate(['/login']);
    }
  }

  // Add this method to src/app/features/rooms/room-list/room-list.component.ts
  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return path;
  }
}
