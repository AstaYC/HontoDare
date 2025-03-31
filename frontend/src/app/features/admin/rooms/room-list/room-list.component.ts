// src/app/features/admin/rooms/room-list/room-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RoomService } from '../../../../core/services/room.service';
import { Room } from '../../../../core/models/room.model';
import { AdminHeaderComponent } from '../../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    HttpClientModule
  ],
  templateUrl: './room-list.component.html',
  styleUrls: ['./room-list.component.css']
})
export class RoomAdminListComponent implements OnInit {
  rooms: Room[] = [];
  loading = true;
  categories: string[] = [];

  constructor(private roomService: RoomService) {}

  ngOnInit(): void {
    this.loadRooms();
  }

  loadRooms(): void {
    this.loading = true;
    this.roomService.getRooms().subscribe({
      next: (data) => {
        this.rooms = data;
        // Extract unique categories
        this.categories = [...new Set(data.map(room => room.category))];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching rooms:', error);
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.loading = true;
    this.roomService.getRoomsByCategory(category).subscribe({
      next: (data) => {
        this.rooms = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching rooms by category:', error);
        this.loading = false;
      }
    });
  }

  resetFilter(): void {
    this.loadRooms();
  }

  deleteRoom(id: number): void {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(id).subscribe({
        next: () => {
          this.loadRooms();
        },
        error: (error) => {
          console.error('Error deleting room:', error);
        }
      });
    }
  }
}
