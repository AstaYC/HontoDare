import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { TokenService } from '../services/token.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private tokenService: TokenService , private router: Router) {}

  intercept(req : HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenService.getToken();
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          this.tokenService.clearToken(); // Clear the invalid token
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
