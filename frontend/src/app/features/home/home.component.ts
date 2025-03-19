import { Component } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterModule } from "@angular/router"
import {LayoutComponent} from "../../shared/layout/layout.component";
import {NavbarComponent} from "../../shared/navbar/navbar.component";
import {FooterComponent} from "../../shared/footer/footer.component";

interface Step {
  icon: string
  title: string
  description: string
}

interface Feature {
  icon: string
  title: string
  description: string
}

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent, NavbarComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ["./home.component.css"],
})
export class HomeComponent {
  steps: Step[] = [
    {
      icon: "crosshairs",
      title: "Join a Room",
      description: "Select a themed room that matches your interests and knowledge.",
    },
    {
      icon: "shield",
      title: "Upload Character",
      description: "Choose a character for your opponent to guess.",
    },
    {
      icon: "message",
      title: "Ask Questions",
      description: "Take turns asking yes/no questions to identify the character.",
    },
    {
      icon: "gavel",
      title: "Make Your Guess",
      description: "First to correctly guess the opponent's character wins!",
    },
  ]

  features: Feature[] = [
    {
      icon: "users",
      title: "Smart Matchmaking",
      description: "Get paired with players who share your interests for the most engaging matches.",
    },
    {
      icon: "message",
      title: "Dual Chat System",
      description: "Dedicated yes/no guessing chat plus a free chat for discussions.",
    },
    {
      icon: "trophy",
      title: "Competitive Ranking",
      description: "Climb the leaderboards and show off your character knowledge!",
    },
  ]

  // Add this to your component class
  openGameModal(event: Event): void {
    event.preventDefault();
    const modal = document.getElementById('gameModal');
    const modalContent = modal?.querySelector('.modal-content') as HTMLElement;
    const button = event.currentTarget as HTMLElement;

    if (modal && modalContent) {
      // Get button position
      const buttonRect = button.getBoundingClientRect();

      // Set initial position for animation
      modalContent.style.transformOrigin = `center ${window.innerHeight - buttonRect.top}px`;

      // Show modal
      modal.classList.remove('hidden');
    }
  }
}
