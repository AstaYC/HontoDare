import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Remove "type" keyword
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-defeat-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './defeat-modal.component.html',
  styleUrls: ['./defeat-modal.component.css'],
  animations: [
    trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('500ms ease-in', style({ opacity: 1 }))])]),
    trigger('slideUp', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('800ms ease-out', style({ transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('pulse', [
      transition(':enter', [
        style({ transform: 'scale(0.8)' }),
        animate('600ms 300ms ease-out', style({ transform: 'scale(1)' })),
      ]),
    ]),
  ],
})

export class DefeatModalComponent implements OnInit {
  @Input() playerName = '';
  countdown = 3; // Countdown in seconds
  private countdownInterval: any;
  private startTime: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Record the start time for more accurate timing
    this.startTime = Date.now();

    // Start countdown for redirect
    this.countdownInterval = setInterval(() => {
      const elapsedTime = Date.now() - this.startTime;
      this.countdown = Math.max(3 - Math.floor(elapsedTime / 1000), 0);

      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
        this.router.navigate(['/home']);
      }
    }, 100); // Check more frequently for smoother countdown

    // Play victory sound
    this.playDefeatSound();
  }
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private playDefeatSound(): void {
    try {
      const audio = new Audio('assets/sounds/defeat.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => console.error('Error playing sound:', error));
    } catch (error) {
      console.error('Error with audio:', error);
    }
  }
}
