import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { getUser } from '../core/utils/auth.util';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = sessionStorage.getItem('connecthub_token');

    if (!token) {
      return this.router.createUrlTree(['/login']);
    }

    if (this.router.url.includes('/admin')) {
      const user = getUser();
      if (user?.role !== 'SUPER_ADMIN') {
        return this.router.createUrlTree(['/chat']);
      }
    }

    return true;
  }
}

// import { Injectable } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthGuard implements CanActivate {
//   constructor(private router: Router) {}

//   canActivate(): boolean {
//     const token = localStorage.getItem('connecthub_token');

//     if (!token) {
//       this.router.navigate(['/login']);
//       return false;
//     }

//     return true;
//   }
// }
