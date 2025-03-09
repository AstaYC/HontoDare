// src/app/core/services/token.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private TOKEN_KEY = 'auth-token';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  saveToken(token: string): void {
    if (this.isBrowser) {
      console.log('Saving token:', token);
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      const token = localStorage.getItem(this.TOKEN_KEY);
      console.log('Retrieving token:', token);
      return token;
    }
    return null;
  }

  removeToken(): void {
    if (this.isBrowser) {
      console.log('Removing token');
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  getDecodedToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.getDecodedToken(token);
      return decodedToken?.role || null; // Corrected to "role" instead of "roles"
    }
    return null;
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.getDecodedToken(token);
      return decodedToken?.userId || null; // Corrected to "userId" instead of "playerId"
    }
    return null;
  }

  clearToken(): void {
    this.removeToken();
  }
}
