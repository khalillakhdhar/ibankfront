import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { SessionStorageService } from '../services/session-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = inject(API_BASE_URL);
  const sessionStorage = inject(SessionStorageService);
  const router = inject(Router);
  const session = sessionStorage.read();
  const apiRequest = request.url === apiBaseUrl || request.url.startsWith(`${apiBaseUrl}/`);
  const authenticatedRequest =
    apiRequest && session
      ? request.clone({ setHeaders: { Authorization: `Bearer ${session.token}` } })
      : request;

  return next(authenticatedRequest).pipe(
    catchError((error) => {
      if (apiRequest && error?.status === 401) {
        sessionStorage.clear();
        void router.navigateByUrl('/login');
      }
      return throwError(() => error);
    }),
  );
};
