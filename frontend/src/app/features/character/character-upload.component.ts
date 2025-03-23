import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { CharacterService } from '../../core/services/character.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { RoomService } from '../../core/services/room.service';


@Component({
  selector: 'app-character-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './character-upload.component.html',
  styleUrls: ['./character-upload.component.css']
})
export class CharacterUploadComponent implements OnInit, OnDestroy {
  roomId!: number;
  playerId: string | null = null;
  characterName: string = '';
  characterGlance: string = '';
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  uploadStatus: 'success' | 'error' | null = null;
  statusMessage: string = '';
  roomSubscription?: Subscription;
  dragActive: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private characterService: CharacterService,
    private authService: AuthService,
    private webSocketService: WebSocketService,
    private roomService: RoomService

) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.createPreview(this.selectedFile);
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragActive = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
      this.selectedFile = event.dataTransfer.files[0];
      this.createPreview(this.selectedFile);
    }
  }

  createPreview(file: File) {
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // In character-upload.component.ts, modify the uploadCharacter method

  uploadCharacter() {
    if (!this.selectedFile || !this.characterName) {
      this.uploadStatus = 'error';
      this.statusMessage = 'Please provide both a character name and image';
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.uploadStatus = null;
    this.statusMessage = '';

    const characterData = {
      name: this.characterName,
      category: 'Game Upload',
      glance: this.characterGlance || 'Character uploaded by player',
      userId: Number(this.playerId),
      roomId: this.roomId
    };

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('character', JSON.stringify(characterData));

    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);

    this.characterService.uploadCharacter(formData)
      .subscribe({
        next: async (response: any) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 100;
          this.uploadStatus = 'success';
          this.statusMessage = 'Character uploaded successfully! Waiting for opponent...';

          console.log('Character upload response:', response);

          // Check for character ID in different possible locations
          const characterId = response.character?.id || response.id;

          if (characterId) {
            const storageKey = `character_${this.roomId}_${this.playerId}`;
            localStorage.setItem(storageKey, characterId.toString());
            console.log(`Character ID ${characterId} stored in localStorage with key: ${storageKey}`);

            // Verify storage worked
            const storedValue = localStorage.getItem(storageKey);
            console.log(`Verification - value retrieved from localStorage: ${storedValue}`);

            if (this.playerId) {
              try {
                await this.webSocketService.sendChatMessage(
                  JSON.stringify({
                    characterId: characterId
                  }),
                  'CHARACTER_UPLOADED',
                  this.playerId,
                  this.roomId
                );
                await this.webSocketService.trackCharacterUpload(this.roomId, this.playerId);
              } catch (error) {
                this.statusMessage = 'Upload complete but failed to notify opponent. Please refresh.';
              }
            }
          } else {
            console.error('Could not find character ID in response:', response);
          }
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadStatus = 'error';
          this.statusMessage = 'Upload failed: ' + (error.error?.error || error.message);
        }
      });
  }

  ngOnInit() {
    this.roomId = parseInt(this.route.snapshot.paramMap.get('id') || '0', 10);
    this.playerId = this.authService.getCurrentUserId()?.toString() || null;

    if (!this.playerId) {
      this.router.navigate(['/login']);
      return;
    }

    this.initializeWebSocket();
  }

  private async initializeWebSocket() {
    console.log('Current localStorage state:', {
      characterIdForPlayer: localStorage.getItem(`character_${this.roomId}_${this.playerId}`),
      playerId: this.playerId,
      roomId: this.roomId
    });
    try {
      // Ensure we're connected to WebSocket
      await this.webSocketService.connect(this.playerId!, this.roomId);

      this.roomSubscription = this.webSocketService.subscribeToRoom(this.roomId)
        .subscribe({
          next: (message: any) => {
            console.log('Received message:', message);

            switch (message.type) {
              case 'CHARACTER_UPLOADED':
                if (message.sender !== this.playerId) {
                  this.webSocketService.trackCharacterUpload(this.roomId, message.sender)
                    .catch(error => console.error('Failed to track opponent upload:', error));
                  this.statusMessage = 'Your opponent has uploaded their character!';
                }
                break;

              // In character-upload.component.ts, update the ALL_PLAYERS_UPLOADED case
              case 'ALL_PLAYERS_UPLOADED':
                this.statusMessage = 'Both players ready! Initializing game...';

                // Use RoomService to get room users instead of WebSocket message content
                this.roomService.getRoomUsers(this.roomId).subscribe({
                  next: (users) => {
                    console.log('Room users from API:', users);

                    // Find opponent (any user that's not the current player)
                    const opponent = users.find(u => u.userId.toString() !== this.playerId);

                    if (opponent && this.playerId) {
                      const opponentId = opponent.userId.toString();
                      console.log('Found opponent from room data:', opponentId);

                      this.webSocketService.trackGameStart(this.roomId, this.playerId, opponentId)
                        .then(() => {
                          console.log('Game tracking successful, navigating to game screen');
                          this.statusMessage = 'Game initialized! Redirecting to game...';
                          setTimeout(() => {
                            this.router.navigate(['/game', this.roomId]);
                          }, 1500);
                        })
                        .catch(error => {
                          console.error('Failed to track game start:', error);
                          this.navigateToGameFallback();
                        });
                    } else {
                      console.error('Could not find opponent in room users');
                      this.navigateToGameFallback();
                    }
                  },
                  error: (err) => {
                    console.error('Failed to get room users:', err);
                    this.navigateToGameFallback();
                  }
                });
                break;
            }
          },
          error: (error) => {
            console.error('Room subscription error:', error);
            this.statusMessage = 'Connection error. Please refresh the page.';
          }
        });
    } catch (error) {
      console.error('WebSocket initialization error:', error);
      this.statusMessage = 'Connection error. Please refresh the page.';
      this.uploadStatus = 'error';
    }
  }

// Helper method for fallback navigation
  private navigateToGameFallback() {
    console.log('Players data not available in message, navigating directly to game');
    this.statusMessage = 'Proceeding to game...';
    setTimeout(() => {
      this.router.navigate(['/game', this.roomId]);
    }, 1500);
  }



  async leaveGame() {
    if (confirm('Are you sure you want to leave the game? Your progress will be lost.')) {
      if (this.playerId) {
        try {
          // Ensure WebSocket connection exists
          await this.webSocketService.connect(this.playerId, this.roomId);

          // Send leave message
          this.webSocketService.sendLeaveRoomMessage(this.roomId, this.playerId);

          // Clean up subscriptions
          if (this.roomSubscription) {
            this.roomSubscription.unsubscribe();
          }

          // Clear uploads
          this.webSocketService.clearUploads(this.roomId);

          // Disconnect WebSocket
          this.webSocketService.disconnect();

          // Navigate back to rooms
          await this.router.navigate(['/rooms']);
          console.log('Successfully left the game');
        } catch (error) {
          console.error('Error leaving game:', error);
          // Navigate anyway in case of error
          this.router.navigate(['/rooms']).catch(err =>
            console.error('Navigation error:', err)
          );
        }
      }
    }
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.roomSubscription) {
      this.roomSubscription.unsubscribe();
    }
  }
}
