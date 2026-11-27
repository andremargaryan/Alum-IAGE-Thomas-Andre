import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isPublicAuthRequest =
    req.url.includes('/api/auth/login') ||
    req.url.includes('/api/auth/register') ||
    (req.url.endsWith('/users') && req.method === 'POST');

  if (token && !isPublicAuthRequest) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};