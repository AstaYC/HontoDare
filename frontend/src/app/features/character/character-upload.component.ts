// src/app/features/character/character-upload.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../../core/services/websocket.service';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { Subscription } from 'rxjs';

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
    private http: HttpClient,
    private authService: AuthService,
    private webSocketService: WebSocketService
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
      glance: 'Character uploaded by player',
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

    this.http.post(`${environment.apiUrl}/api/character/upload`, formData)
      .subscribe({
        next: async (response: any) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 100;
          this.uploadStatus = 'success';
          this.statusMessage = 'Character uploaded successfully! Waiting for opponent...';

          if (this.playerId) {
            try {
              await this.webSocketService.trackCharacterUpload(this.roomId, this.playerId);
              await this.webSocketService.sendChatMessage(
                'CHARACTER_UPLOADED',
                'GAME_STATE',
                this.playerId,
                this.roomId
              );
            } catch (error) {
              this.statusMessage = 'Upload complete but failed to notify opponent. Please refresh.';
            }
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
    try {
      await this.webSocketService.connect(this.playerId!, this.roomId);
      this.roomSubscription = this.webSocketService.subscribeToRoom(this.roomId)
        .subscribe({
          next: (message: any) => {
            switch (message.type) {
              case 'CHARACTER_UPLOADED':
                if (message.playerId !== this.playerId) {
                  this.webSocketService.trackCharacterUpload(this.roomId, message.playerId)
                    .catch(error => console.error('Failed to track opponent upload:', error));
                  this.statusMessage = 'Your opponent has uploaded their character!';
                }
                break;

              case 'ALL_PLAYERS_UPLOADED':
                this.statusMessage = 'Both players ready! Redirecting to game...';
                if (this.roomSubscription) {
                  this.roomSubscription.unsubscribe();
                }
                setTimeout(() => {
                  this.router.navigate(['/game', this.roomId])
                    .catch(err => console.error('Navigation error:', err));
                }, 1500);
                break;
            }
          },
          error: (error) => {
            this.statusMessage = 'Connection error. Please refresh the page.';
          }
        });
    } catch (error) {
      this.statusMessage = 'Connection error. Please refresh the page.';
      this.uploadStatus = 'error';
    }
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
