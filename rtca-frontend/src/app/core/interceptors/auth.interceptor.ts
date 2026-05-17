import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const publicUrls = ['/auth/login', '/auth/register', '/auth/logout', '/oauth2', '/login'];

  const isPublicRequest = publicUrls.some((url) => req.url.includes(url));

  // Do NOT attach old token for public endpoints
  if (isPublicRequest) {
    return next(req);
  }

  const token = sessionStorage.getItem('connecthub_token');

  // Attach token for all non-public requests
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Pass the request to the next handler
  return next(req);
};
