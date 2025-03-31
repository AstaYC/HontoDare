// src/app/features/profile/profile.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  loading = false;
  submitSuccess = false;
  submitError = '';
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  apiBaseUrl = environment.apiUrl;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const userId = this.authService.getCurrentUserId();
    if (userId) {
      this.loading = true;
      this.profileService.getCurrentUserProfile(userId)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (user) => {
            this.user = user;
            this.profileForm.patchValue({
              username: user.username,
              name: user.name,
              email: user.email
            });

            if (user.avatarUrl) {
              this.previewUrl = this.getImageUrl(user.avatarUrl);
            }
          },
          error: (error) => {
            console.error('Error loading user profile', error);
          }
        });
    }
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] as File;
    if (this.selectedFile) {
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const userId = this.authService.getCurrentUserId();
    if (!userId) return;

    // Check if password and confirmPassword match
    const password = this.profileForm.get('password')?.value;
    const confirmPassword = this.profileForm.get('confirmPassword')?.value;

    if (password && password !== confirmPassword) {
      this.submitError = 'Passwords do not match';
      return;
    }

    // Create user data object similar to admin form
    const userData: any = {
      id: userId,
      username: this.profileForm.get('username')?.value,
      name: this.profileForm.get('name')?.value,
      email: this.profileForm.get('email')?.value,
      points: this.user?.points || 0,
      role: this.user?.role
    };

    // Only add password if provided and not empty
    if (password && password.trim() !== '') {
      userData.password = password;
    }

    // If there's a file, handle it separately
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('avatar', this.selectedFile);
      const userDataJson = JSON.stringify(userData);
      formData.append('userData', userDataJson);

      this.loading = true;
      this.profileService.updateUserProfile(userId, formData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            this.user = response;
            this.submitSuccess = true;
            this.submitError = '';
            setTimeout(() => this.submitSuccess = false, 3000);
          },
          error: (error) => {
            console.error('Error updating profile with file:', error);
            this.submitError = error.error?.message || 'Failed to update profile. Please try again.';
          }
        });
    } else {
      // If no file, just update the user data directly like the admin form does
      this.loading = true;
      this.profileService.updateUserData(userId, userData)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (response) => {
            this.user = response;
            this.submitSuccess = true;
            this.submitError = '';
            setTimeout(() => this.submitSuccess = false, 3000);
          },
          error: (error) => {
            console.error('Error updating profile:', error);
            this.submitError = error.error?.message || 'Failed to update profile. Please try again.';
          }
        });
    }
  }


  getImageUrl(path: string): string {
    if (!path) return '';

    if (path.startsWith('http')) {
      return path;
    }

    if (path.includes('/assets/')) {
      return path.startsWith('/') ? path.substring(1) : path;
    }

    return this.apiBaseUrl + (path.startsWith('/') ? path : '/' + path);
  }
}
