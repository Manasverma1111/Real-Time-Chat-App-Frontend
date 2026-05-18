import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /*
   CRITICAL FIX:
   Removed '/auth/logout' from publicUrls.
   Logout MUST include the Authorization header so
   AuthResource can extract the email from the token
   and call updateStatus(OFFLINE) to update the DB.

   Previously logout was treated as public → no token attached
   → userDetails was null → email was null → DB never updated.
  */
  const publicUrls = ['/auth/login', '/auth/register', '/oauth2', '/login'];

  const isPublicRequest = publicUrls.some((url) => req.url.includes(url));

  if (isPublicRequest) {
    return next(req);
  }

  const token = sessionStorage.getItem('connecthub_token');

  // If token exists, clone the request and add the Authorization header with the Bearer token
  // This ensures that all authenticated API requests include the JWT token for authorization on the backend.
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
