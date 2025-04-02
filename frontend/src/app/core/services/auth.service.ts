import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TokenService } from './token.service';
import { inject } from '@angular/core';
import {User} from "../models/user.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    const token = this.tokenService.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  login(email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { email, password };
    return this.http.post(`${this.apiUrl}/api/users/login`, body, { headers, responseType: 'text' }).pipe(
      tap((response: any) => {
        if (response) {
          this.tokenService.saveToken(response);
          const userRole = this.tokenService.getUserRole();
          if (userRole) {
            localStorage.setItem('role', userRole);
          }

          const userData = this.tokenService.getDecodedToken(response);
          if (userData) {
            if (userData.username) {
              localStorage.setItem('username', userData.username);
            }
            if (userData.name) {
              localStorage.setItem('name', userData.name);
            }
          }

          this.isAuthenticatedSubject.next(true);
        }
      }),
      catchError(error => {
        console.error('Login failed', error);
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        return of(null);
      })
    );
  }

  register(name: string , username: string, email: string, password: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const body = { name, username, email, password };
    return this.http.post(`${this.apiUrl}/api/users/register`, body, { headers,responseType: 'text'})
      .pipe(
      tap((response) => {
        if (response) {
          // localStorage.setItem('username', username);
          // localStorage.setItem('name', name);
        }
      }),
      catchError(error => {
        console.error('Registration failed', error);
        return throwError(() => error);
      })
    );
  }
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/api/auth/refresh`, { refreshToken }).pipe(
      map(response => response.accessToken),
      catchError((error) => {
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.tokenService.clearToken();
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
      }),
      catchError(error => {
        console.error('Logout failed', error);
        this.tokenService.clearToken();
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        this.isAuthenticatedSubject.next(false);
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  getToken(): string | null {
    return this.tokenService.getToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  getCurrentUser(): any {
    const token = this.tokenService.getToken();
    if (token) {
      return this.tokenService.getDecodedToken(token);
    }
    return null;
  }

  getCurrentUserId(): number | null {
    return this.tokenService.getUserId();
  }

  isAuthenticated(): boolean {
    return !!this.tokenService.getToken();
  }

  private errorMessage: string = '';

  updateUserProfile(userId: number, userData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData);
  }

  getUserName(): string | null {
    return localStorage.getItem('username') || this.tokenService.getUsername();
  }

  getFullName(): string | null {
    return localStorage.getItem('name') || this.tokenService.getName();
  }


}
