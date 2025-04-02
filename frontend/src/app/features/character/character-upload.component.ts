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
  redirecting: boolean = false;
  waitingForOpponent: boolean = true;
  systemMessages: any[] = [];
  playerName: string = '';
  opponentName: string = '';
  opponentId: string | null = null;
  opponentJoined: boolean = false;
  freeChatSubscription?: Subscription;

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

// In character-upload.component.ts - modify the uploadCharacter method
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
          this.statusMessage = 'Character uploaded successfully! Redirecting to game...';

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
                console.error('Failed to notify character upload:', error);
              }

              // Navigate to game immediately after upload
              setTimeout(() => {
                this.router.navigate(['/game', this.roomId]);
              }, 1500);
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

    this.leaveRoom();

    this.waitingForOpponent = true;
    this.systemMessages = [];

    this.initializeWebSocket();
  }

  private async initializeWebSocket() {
    try {
      await this.webSocketService.connect(this.playerId!, this.roomId);

      // Send a player join notification when connecting
      this.webSocketService.sendChatMessage(
        `PLAYER_JOINED:${this.playerName}`,
        'SYSTEM_MESSAGE',
        this.playerId!,
        this.roomId
      );

      // Add self-join message
      this.addSystemMessage(`You joined the chat.`);

      this.roomSubscription = this.webSocketService.subscribeToRoom(this.roomId)
        .subscribe({
          next: (message: any) => {
            console.log('Room message received:', message);

            switch (message.type) {
              case 'CHARACTER_UPLOADED':
                if (message.sender !== this.playerId) {
                  this.webSocketService.trackCharacterUpload(this.roomId, message.sender)
                    .catch(error => console.error('Failed to track opponent upload:', error));
                  this.statusMessage = 'Your opponent has uploaded their character!';
                }
                break;

            }
          },
          error: (error) => {
            console.error('Room subscription error:', error);
            this.statusMessage = 'Connection error. Please refresh the page.';
            this.uploadStatus = 'error';
          }
        });

      this.freeChatSubscription = this.webSocketService
        .subscribe(`/topic/room/${this.roomId}/free`)
        .subscribe({
          next: (message: any) => {
            console.log('Free chat message received:', message);

            if (message.type === 'SYSTEM_MESSAGE' && message.content.startsWith('PLAYER_JOINED:')) {
              const joiningPlayerName = message.content.substring('PLAYER_JOINED:'.length);

              if (message.sender !== this.playerId) {
                this.opponentId = message.sender;
                this.opponentName = joiningPlayerName;
                this.opponentJoined = true;
                this.waitingForOpponent = false;
                this.addSystemMessage(`${joiningPlayerName} joined the chat.`);
              }
            }
          },
          error: (error) => console.error('Free chat subscription error:', error)
        });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.statusMessage = 'Connection error. Please refresh the page.';
      this.uploadStatus = 'error';
    }
  }

  addSystemMessage(message: string) {
    this.systemMessages.push({
      content: message,
      timestamp: new Date()
    });
    console.log('System message added:', message);
  }

  async leaveGame() {
    if (confirm('Are you sure you want to leave the game? Your progress will be lost.')) {
      if (this.playerId) {
        try {
          await this.webSocketService.connect(this.playerId, this.roomId);

          this.webSocketService.sendLeaveRoomMessage(this.roomId, this.playerId);

          if (this.roomSubscription) {
            this.roomSubscription.unsubscribe();
          }

          this.webSocketService.clearUploads(this.roomId);

          this.webSocketService.disconnect();

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

  leaveRoom() {
    const playerId = this.authService.getCurrentUserId();
    if (playerId) {
      this.webSocketService.sendLeaveRoomMessage(this.roomId, playerId.toString());

      this.roomService.leaveRoom(this.roomId, playerId).subscribe({
        next: () => {
          this.webSocketService.disconnect();
        },
        error: (err) => console.error('Failed to leave room:', err)
      });
    }
  }
}

