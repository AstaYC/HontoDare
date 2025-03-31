// src/app/features/admin/rooms/room-form/room-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoomService } from '../../../../core/services/room.service';
import { Room } from '../../../../core/models/room.model';
import { AdminHeaderComponent } from '../../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    HttpClientModule
  ],
  templateUrl: './room-form.component.html',
  styleUrls: ['./room-form.component.css']
})
export class RoomFormComponent implements OnInit {
  roomForm: FormGroup;
  isEditing = false;
  roomId: number | null = null;
  loading = false;

  // Predefined categories - you may want to load these from an API
  categories = ['Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle'];

  constructor(
    private fb: FormBuilder,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.roomForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.roomId = +params['id'];
        this.loadRoom(this.roomId);
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      maxPlayers: ['2', [Validators.required, Validators.pattern(/^\d+$/)]],
      category: ['', Validators.required]
    });
  }

  loadRoom(id: number): void {
    this.loading = true;

    // Find room in the list - this approach assumes you might have rooms loaded elsewhere
    // For a real app, you might want to add a getRoomById method to your service
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        const room = rooms.find(r => r.id === id);
        if (room) {
          this.roomForm.patchValue({
            name: room.name,
            description: room.description,
            maxPlayers: room.maxPlayers,
            category: room.category
          });
        } else {
          console.error('Room not found');
          this.router.navigate(['/admin/rooms']);
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading room:', error);
        this.loading = false;
        this.router.navigate(['/admin/rooms']);
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) return;

    const roomData = this.roomForm.value as Room;
    this.loading = true;

    if (this.isEditing && this.roomId) {
      roomData.id = this.roomId;
      this.roomService.updateRoom(roomData).subscribe({
        next: () => {
          this.router.navigate(['/admin/rooms']);
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.loading = false;
        }
      });
    } else {
      this.roomService.createRoom(roomData).subscribe({
        next: () => {
          this.router.navigate(['/admin/rooms']);
        },
        error: (error) => {
          console.error('Error creating room:', error);
          this.loading = false;
        }
      });
    }
  }
}
