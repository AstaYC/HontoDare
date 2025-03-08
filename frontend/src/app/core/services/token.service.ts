// src/app/core/services/token.service.ts
import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private TOKEN_KEY = 'auth-token';

  constructor() {}

  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getDecodedToken(token: string): any {
    return jwtDecode(token);
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.getDecodedToken(token);
      return decodedToken.role; // Adjust based on your backend's JWT structure
    }
    return null;
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (token) {
      const decodedToken = this.getDecodedToken(token);
      return decodedToken.userId; // Adjust based on your backend's JWT structure
    }
    return null;
  }
}
