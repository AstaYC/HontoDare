// src/app/features/admin/characters/character-list/character-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CharacterService } from '../../../../core/services/character.service';
import { UserService } from '../../../../core/services/user.service';
import { RoomService } from '../../../../core/services/room.service';
import { Character } from '../../../../core/models/character.model';
import { forkJoin } from 'rxjs';
import { AdminHeaderComponent } from "../../admin-header/admin-header.component";
import { HttpClientModule } from "@angular/common/http";
import { AdminSidebarComponent } from "../../admin-sidebar/admin-sidebar.component";
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-character-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    AdminHeaderComponent,
    AdminSidebarComponent,
    HttpClientModule
  ],
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css']
})
export class CharacterListComponent implements OnInit {
  characters: Character[] = [];
  loading = true;
  categories: string[] = [];
  apiBaseUrl = environment.apiUrl;

  constructor(
      private characterService: CharacterService,
      private userService: UserService,
      private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;

    this.characterService.getAllCharacters().subscribe({
      next: (characters) => {
        // Store characters first
        this.characters = characters;

        // Prepare for fetching users and rooms
        const userIds = [...new Set(this.characters
            .filter(c => c.userId)
            .map(c => c.userId as number))];

        const roomIds = [...new Set(this.characters
            .filter(c => c.roomId)
            .map(c => c.roomId as number))];

        // Create array for parallel API requests
        const requests = [];

        if (userIds.length > 0) {
          requests.push(this.userService.getUsers());
        }

        if (roomIds.length > 0) {
          requests.push(this.roomService.getRooms());
        }

        if (requests.length > 0) {
          forkJoin(requests).subscribe({
            next: (results) => {
              // Process user data if available
              if (userIds.length > 0) {
                const users = results[0];
                const userMap = new Map(users.map(user => [user.id, user]));

                // Add user objects to characters
                this.characters = this.characters.map(character => {
                  if (character.userId && userMap.has(character.userId)) {
                    return {...character, user: userMap.get(character.userId)};
                  }
                  return character;
                });
              }

              // Process room data if available
              if (roomIds.length > 0) {
                const rooms = results[userIds.length > 0 ? 1 : 0];
                const roomMap = new Map(rooms.map(room => [room.id, room]));

                // Add room objects to characters
                this.characters = this.characters.map(character => {
                  if (character.roomId && roomMap.has(character.roomId)) {
                    return {...character, room: roomMap.get(character.roomId)};
                  }
                  return character;
                });
              }

              // Fix image URLs if needed
              this.characters = this.characters.map(character => {
                if (character.picUrl && !character.picUrl.startsWith('http') && !character.picUrl.startsWith('/')) {
                  return {...character, picUrl: `${this.apiBaseUrl}/${character.picUrl}`};
                } else if (character.picUrl && character.picUrl.startsWith('/')) {
                  return {...character, picUrl: `${this.apiBaseUrl}${character.picUrl}`};
                }
                return character;
              });

              this.categories = [...new Set(this.characters.map(character => character.category))];
              this.loading = false;
            },
            error: (error) => {
              console.error('Error fetching related data:', error);
              this.loading = false;
            }
          });
        } else {
          this.categories = [...new Set(characters.map(character => character.category))];
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching characters:', error);
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    this.loading = true;
    this.characterService.getCharactersByCategory(category).subscribe({
      next: (data) => {
        this.characters = data;
        this.loading = false;

        // Also need to load users and rooms for these filtered characters
        this.loadRelatedData();
      },
      error: (error) => {
        console.error('Error fetching characters by category:', error);
        this.loading = false;
      }
    });
  }

  loadRelatedData(): void {
    // Only run this if we have characters
    if (this.characters.length === 0) return;

    const userIds = [...new Set(this.characters
        .filter(c => c.userId)
        .map(c => c.userId as number))];

    const roomIds = [...new Set(this.characters
        .filter(c => c.roomId)
        .map(c => c.roomId as number))];

    const requests = [];

    if (userIds.length > 0) {
      requests.push(this.userService.getUsers());
    }

    if (roomIds.length > 0) {
      requests.push(this.roomService.getRooms());
    }

    if (requests.length > 0) {
      forkJoin(requests).subscribe({
        next: (results) => {
          // Same logic as in loadCharacters()
          // Process user data
          if (userIds.length > 0) {
            const users = results[0];
            const userMap = new Map(users.map(user => [user.id, user]));

            this.characters = this.characters.map(character => {
              if (character.userId && userMap.has(character.userId)) {
                return {...character, user: userMap.get(character.userId)};
              }
              return character;
            });
          }

          // Process room data
          if (roomIds.length > 0) {
            const rooms = results[userIds.length > 0 ? 1 : 0];
            const roomMap = new Map(rooms.map(room => [room.id, room]));

            this.characters = this.characters.map(character => {
              if (character.roomId && roomMap.has(character.roomId)) {
                return {...character, room: roomMap.get(character.roomId)};
              }
              return character;
            });
          }
        }
      });
    }
  }

  resetFilter(): void {
    this.loadCharacters();
  }

  deleteCharacter(id: number): void {
    if (confirm('Are you sure you want to delete this character?')) {
      this.characterService.deleteCharacter(id).subscribe({
        next: () => {
          this.loadCharacters();
        },
        error: (error) => {
          console.error('Error deleting character:', error);
        }
      });
    }
  }

  // Helper method to get full image URL
  getImageUrl(path: string): string {
    if (!path) return '';

    // Strip the API base URL if present to get just the asset path
    if (path.includes(this.apiBaseUrl)) {
      path = path.replace(this.apiBaseUrl, '');
    }

    // Handle paths that contain /assets/
    if (path.includes('/assets/')) {
      // Remove leading slash to use as relative path
      return path.startsWith('/') ? path.substring(1) : path;
    }

    // For other cases (full URLs not matching our API)
    return path;
  }

}
