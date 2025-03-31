import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { AdminHeaderComponent } from "../admin-header/admin-header.component";
import { AdminSidebarComponent } from "../admin-sidebar/admin-sidebar.component";

@Component({
  selector: "app-admin-layout",
  standalone: true,
  imports: [CommonModule, RouterModule, AdminHeaderComponent, AdminSidebarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-gray-900 text-white">
      <app-admin-sidebar></app-admin-sidebar>
      <div class="flex flex-col flex-1 overflow-hidden">
        <app-admin-header></app-admin-header>
        <main class="flex-1 overflow-y-auto p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {}
