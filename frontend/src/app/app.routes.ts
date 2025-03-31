// src/app/app.routes.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './features/home/home.component';
import { RoomListComponent } from './features/rooms/room-list/room-list.component';
import { WaitingRoomComponent } from './features/rooms/waiting-room/waiting-room.component';
import {GameComponent} from "./features/game/game.component";
import {AdminHeaderComponent} from "./features/admin/admin-header/admin-header.component";
import {AdminSidebarComponent} from "./features/admin/admin-sidebar/admin-sidebar.component";
import {AdminLayoutComponent} from "./features/admin/admin-layout/admin-layout.component";
import {UserListComponent} from "./features/admin/users/user-list/user-list.component";
import {UserFormComponent} from "./features/admin/users/user-form/user-form.component";
import {RoomFormComponent} from "./features/admin/rooms/room-form/room-form.component";
import {RoomAdminListComponent} from "./features/admin/rooms/room-list/room-list.component";
import {CharacterFormComponent} from "./features/admin/characters/character-form/character-form.component";
import {CharacterListComponent} from "./features/admin/characters/character-list/character-list.component";

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: LoginComponent }, // Ensure register route is correctly set
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'rooms', component: RoomListComponent, canActivate: [AuthGuard] },
  { path: 'waiting-room/:id', component: WaitingRoomComponent, canActivate: [AuthGuard] },
  { path: 'game/:id', component: GameComponent, canActivate: [AuthGuard] },
  { path: 'header', component: AdminSidebarComponent, canActivate: [AuthGuard] },
  {
    path: 'character-upload/:id',
    loadComponent: () => import('./features/character/character-upload.component')
      .then(m => m.CharacterUploadComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/users',
    component: UserListComponent
  },
  {
    path: 'admin/users/create',
    component: UserFormComponent
  },
  {
    path: 'admin/users/edit/:id',
    component: UserFormComponent
  },

  {
    path: 'admin/rooms',
    component: RoomAdminListComponent
  },
  {
    path: 'admin/rooms/create',
    component: RoomFormComponent
  },
  {
    path: 'admin/rooms/edit/:id',
    component: RoomFormComponent
  } ,

  {
    path: 'admin/characters',
    component: CharacterListComponent
  },
  {
    path: 'admin/characters/create',
    component: CharacterFormComponent
  },
  {
    path: 'admin/characters/edit/:id',
    component: CharacterFormComponent
  } ,

  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), FormsModule, ReactiveFormsModule],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AppRoutingModule { }
