import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

@Component({
  selector: 'app-victory-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './victory-modal.component.html',
  styleUrls: ['./victory-modal.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideDown', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)' }),
        animate('800ms ease-out', style({ transform: 'translateY(0)' }))
      ])
    ]),
    trigger('confetti', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate('600ms 300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('gojoAnimation', [
      transition(':enter', [
        animate('3s ease-in-out', keyframes([
          style({ transform: 'translateX(-50%) scale(0.95)', offset: 0 }),
          style({ transform: 'translateX(-50%) scale(1.05)', offset: 0.5 }),
          style({ transform: 'translateX(-50%) scale(1)', offset: 1 })
        ]))
      ])
    ]),
    trigger('textPulse', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class VictoryModalComponent implements OnInit {
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
    this.playVictorySound();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private playVictorySound(): void {
    try {
      const audio = new Audio('assets/sounds/victory.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => console.error('Error playing sound:', error));
    } catch (error) {
      console.error('Error with audio:', error);
    }
  }
}
