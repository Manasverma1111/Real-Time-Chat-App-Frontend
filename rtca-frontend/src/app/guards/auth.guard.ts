import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { getUser } from '../core/utils/auth.util';

// AUTH GUARD: this guard is used to protect routes that require authentication. 
// It checks if a valid authentication token exists in session storage. 
// If the token is missing, it redirects the user to the login page. 
// Additionally, if the user tries to access an admin route without having the 'SUPER_ADMIN' role, 
// it redirects them to the main chat page. This ensures that only authorized users can access certain parts of the application.
@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  // canActivate: this method is called by the Angular router to determine if a route can be activated. 
  // It checks for the presence of an authentication token in session storage. 
  // If the token is not found, it returns a UrlTree that redirects the user to the login page. 
  // If the user is trying to access an admin route, it checks the user's role and redirects to the chat page if they are not a super admin. 
  // If all checks pass, it returns true, allowing the route activation to proceed.
  canActivate(): boolean | UrlTree {
    const token = sessionStorage.getItem('connecthub_token');

    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    // ADDITIONAL CHECK FOR ADMIN ROUTES: if the user tries to access any route that includes '/admin' in the URL, 
    // we check their role to ensure they are a super admin. If they are not, we redirect them to the main chat page.
    if (this.router.url.includes('/admin')) {
      const user = getUser();
      if (user?.role !== 'SUPER_ADMIN') {
        return this.router.createUrlTree(['/chat']);
      }
    }

    return true;
  }
}
