// src/app/features/admin/characters/character-form/character-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CharacterService } from '../../../../core/services/character.service';
import { UserService } from '../../../../core/services/user.service';
import { RoomService } from '../../../../core/services/room.service';
import { Character } from '../../../../core/models/character.model';
import { User } from '../../../../core/models/user.model';
import { Room } from '../../../../core/models/room.model';
import { AdminHeaderComponent } from '../../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-character-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    HttpClientModule
  ],
  templateUrl: './character-form.component.html',
  styleUrls: ['./character-form.component.css']
})
export class CharacterFormComponent implements OnInit {
  characterForm: FormGroup;
  isEditing = false;
  characterId: number | null = null;
  loading = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  users: User[] = [];
  rooms: Room[] = [];

  constructor(
    private fb: FormBuilder,
    private characterService: CharacterService,
    private userService: UserService,
    private roomService: RoomService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.characterForm = this.createForm();
  }

  ngOnInit(): void {
    // Load users and rooms for dropdowns
    this.loadUsers();
    this.loadRooms();

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.characterId = +params['id'];
        this.loadCharacter(this.characterId);
      }
    });

    // When room selection changes, update character category
    this.characterForm.get('roomId')?.valueChanges.subscribe(roomId => {
      if (roomId) {
        const selectedRoom = this.rooms.find(room => room.id === +roomId);
        if (selectedRoom) {
          this.characterForm.get('category')?.setValue(selectedRoom.category);
        }
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      glance: ['', Validators.required],
      picUrl: [''],
      userId: [null],
      roomId: [null]
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.rooms = rooms;
      },
      error: (error) => {
        console.error('Error loading rooms:', error);
      }
    });
  }

  loadCharacter(id: number): void {
    this.loading = true;
    this.characterService.getCharacterById(id).subscribe({
      next: (character) => {
        this.characterForm.patchValue({
          name: character.name,
          category: character.category,
          glance: character.glance,
          picUrl: character.picUrl,
          userId: character.userId,
          roomId: character.roomId
        });

        if (character.picUrl) {
          this.imagePreview = character.picUrl;
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading character:', error);
        this.loading = false;
        this.router.navigate(['/admin/characters']);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;

    // Preview the selected image
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.characterForm.invalid) return;

    this.loading = true;

    // Create a FormData object to handle file upload
    const formData = new FormData();

    // Add character data as JSON string
    const characterData = this.characterForm.value;
    if (this.isEditing && this.characterId) {
      characterData.id = this.characterId;
    }

    formData.append('character', JSON.stringify(characterData));

    // Add file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.isEditing && this.characterId) {
      // For updates, we still use the JSON endpoint as the controller doesn't have a multipart update endpoint
      this.characterService.updateCharacter(this.characterId, characterData).subscribe({
        next: () => {
          this.router.navigate(['/admin/characters']);
        },
        error: (error) => {
          console.error('Error updating character:', error);
          this.loading = false;
        }
      });
    } else {
      // For create, we use the multipart endpoint
      this.characterService.createCharacter(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin/characters']);
        },
        error: (error) => {
          console.error('Error creating character:', error);
          this.loading = false;
        }
      });
    }
  }
}
