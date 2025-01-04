import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { JwtService } from './jwt.service';

@Injectable()
export class Interceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private jwtService: JwtService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip adding token for refresh token requests to prevent loops
    if (request.url.includes('refresh_token')) {
      return next.handle(request);
    }

    // Get the access token from localStorage
    const accessToken = this.getFromLocalStorage('access_token');

    if (accessToken) {
      // Add the access token to the request if it exists
      request = this.addToken(request, accessToken);
    }

    return next.handle(request).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 0) ) {
          // If the token expired or is invalid, handle the 401 error
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getFromLocalStorage('refresh_token');

      if (refreshToken) {

        
        return this.jwtService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;

            // Check if the response is valid and contains new tokens
            const accessToken = response.access_token;
            const refreshToken = response.refresh_token;
            if (accessToken && refreshToken) {
              // Store the new tokens in localStorage
              this.saveToLocalStorage('access_token', accessToken);
              this.saveToLocalStorage('refresh_token', refreshToken);

              // Emit the new access token
              this.refreshTokenSubject.next(accessToken);

              // Retry the original request with the new access token
              return next.handle(this.addToken(request, accessToken));
            } else {
              // If the tokens are not valid, clear storage and redirect to login
              this.clearLocalStorage();
              // You may want to redirect to the login page here
              // this.router.navigate(['/login']);
              return throwError(() => new Error('Failed to refresh token'));
            }
          }),
          catchError((error) => {
            this.isRefreshing = false;

            // If refresh fails, clear tokens and redirect to login
            this.clearLocalStorage();
            // this.router.navigate(['/login']);
            return throwError(() => error);
          })
        );
      }
    }

    // If a refresh is in progress, wait for the new token to be available
    return this.refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addToken(request, token)))
    );
  }

  private getFromLocalStorage(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
    return null;
  }

  private saveToLocalStorage(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  }

  private clearLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
}
