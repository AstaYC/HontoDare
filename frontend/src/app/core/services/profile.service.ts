// src/app/core/services/profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = `${environment.apiUrl}/api/admin/users`;

  constructor(private http: HttpClient) {}

  getCurrentUserProfile(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  updateUserProfile(userId: number, formData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, formData)
      .pipe(catchError(this.handleError));
  }

  updateUserData(userId: number, userData: any): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${userId}`, userData)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status) {
        errorMessage = `Error Code: ${error.status}, Message: ${error.message}`;
      }
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
