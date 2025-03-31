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
import { environment } from '../../../../../environments/environment';

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
  selectedFile: File | null = null;
  previewUrl: string | null = null;

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
      category: ['', Validators.required],
      roomPicUrl: ['']
    });
  }

  loadRoom(id: number): void {
    this.loading = true;

    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        const room = rooms.find(r => r.id === id);
        if (room) {
          this.roomForm.patchValue({
            name: room.name,
            description: room.description,
            maxPlayers: room.maxPlayers,
            category: room.category,
            roomPicUrl: room.roomPicUrl || ''
          });

          if (room.roomPicUrl) {
            this.previewUrl = this.getImageUrl(room.roomPicUrl);
          }
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;

      // Create preview for the selected file
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/assets')) return path; // Assets are served directly
    return environment.apiUrl + path;
  }

  onSubmit(): void {
    if (this.roomForm.invalid) return;

    this.loading = true;
    const roomData = this.roomForm.value as Room;
    const formData = new FormData();

    // Convert roomData to JSON and append to FormData
    formData.append('roomData', JSON.stringify(roomData));

    // Add file if selected
    if (this.selectedFile) {
      formData.append('roomPic', this.selectedFile);
    }

    if (this.isEditing && this.roomId) {
      this.roomService.updateRoomWithImage(this.roomId, formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/rooms']);
        },
        error: (error) => {
          console.error('Error updating room:', error);
          this.loading = false;
        }
      });
    } else {
      this.roomService.createRoomWithImage(formData).subscribe({
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
