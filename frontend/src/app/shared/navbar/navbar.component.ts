import { Component } from '@angular/core';
import { RouterModule } from "@angular/router"
import { CommonModule } from "@angular/common"
import {AuthService} from "../../core/services/auth.service";


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false

  constructor(private authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen
  }

  scrollToHowToPlay() {
    const howToPlaySection = document.getElementById("how-to-play")
    if (howToPlaySection) {
      howToPlaySection.scrollIntoView({ behavior: "smooth" })
    }
  }
}
