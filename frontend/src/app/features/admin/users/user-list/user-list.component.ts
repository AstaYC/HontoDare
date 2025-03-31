// src/app/features/admin/users/user-list/user-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { AdminHeaderComponent } from '../../admin-header/admin-header.component';
import { AdminSidebarComponent } from '../../admin-sidebar/admin-sidebar.component';
import { HttpClientModule } from '@angular/common/http';
import {environment} from "../../../../../environments/environment";

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        AdminHeaderComponent,
        AdminSidebarComponent,
        HttpClientModule
    ],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
    users: User[] = [];
    loading = true;

    constructor(private userService: UserService) {}

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers(): void {
        this.loading = true;
        this.userService.getUsers().subscribe({
            next: (data) => {
                this.users = data;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error fetching users:', error);
                this.loading = false;
            }
        });
    }

    deleteUser(id: number): void {
        if (confirm('Are you sure you want to delete this user?')) {
            this.userService.deleteUser(id).subscribe({
                next: () => {
                    this.loadUsers();
                },
                error: (error) => {
                    console.error('Error deleting user:', error);
                }
            });
        }
    }

  // In
  getImageUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return environment.apiUrl + path;
  }
}
