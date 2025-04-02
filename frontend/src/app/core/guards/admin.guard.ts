import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private tokenService: TokenService, private router: Router) {}

  canActivate(): boolean {
    const userRole = this.tokenService.getUserRole();

    if (userRole === 'ADMIN') {
      return true;
    } else {
      this.router.navigate(['/home']);
      alert('You do not have permission to access this page.');
      return false;
    }
  }
}
