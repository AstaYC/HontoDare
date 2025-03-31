// src/app/features/admin/users/user-form/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { AdminHeaderComponent } from '../../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-user-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AdminHeaderComponent,
        AdminSidebarComponent,
        HttpClientModule
    ],
    templateUrl: './user-form.component.html',
    styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
    userForm: FormGroup;
    isEditing = false;
    userId: number | null = null;
    loading = false;
    roles = ['USER', 'MODERATOR', 'ADMIN'];

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.userForm = this.createForm();
    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            if (params['id']) {
                this.isEditing = true;
                this.userId = +params['id'];
                this.loadUser(this.userId);
            }
        });
    }

    createForm(): FormGroup {
        return this.fb.group({
            username: ['', Validators.required],
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            password: ['', this.isEditing ? null : Validators.required],
            avatarUrl: [''],
            points: [0, [Validators.required, Validators.min(0)]],
            role: ['USER', Validators.required]
        });
    }

    loadUser(id: number): void {
        this.loading = true;
        this.userService.getUserById(id).subscribe({
            next: (user) => {
                // Password is not returned from server
                this.userForm.patchValue({
                    username: user.username,
                    name: user.name,
                    email: user.email,
                    avatarUrl: user.avatarUrl || '',
                    points: user.points,
                    role: user.role
                });

                // Make password optional when editing
                this.userForm.get('password')?.clearValidators();
                this.userForm.get('password')?.updateValueAndValidity();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading user:', error);
                this.loading = false;
                this.router.navigate(['/admin/users']);
            }
        });
    }

  onSubmit(): void {
    if (this.userForm.invalid) return;

    const userData = {...this.userForm.value} as User;
    this.loading = true;

    if (this.isEditing && this.userId) {
      userData.id = this.userId;

      // Remove password if empty
      if (!userData.password) {
        delete userData.password;
      }

      // Remove avatarUrl from direct updates
      // We want this to be controlled by file uploads only
      delete userData.avatarUrl;

      this.userService.updateUser(userData).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.loading = false;
        }
      });
    } else {
      this.userService.createUser(userData).subscribe({
        next: () => {
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.loading = false;
        }
      });
    }

  }

  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return environment.apiUrl + path;
  }

}
