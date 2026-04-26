import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-oauth-success',
  template: `<div>Logging you in...</div>`,
})
export class OAuthSuccessComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (token) {
        localStorage.setItem('connecthub_token', token);
      }

      this.router.navigate(['/chat']);
    }
  }
}

// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-oauth-success',
//   template: `<div>Logging you in...</div>`,
// })
// export class OAuthSuccessComponent implements OnInit {
//   constructor(private router: Router) {}

//   ngOnInit(): void {
//     const params = new URLSearchParams(window.location.search);
//     const token = params.get('token');

//     if (token) {
//       localStorage.setItem('connecthub_token', token);
//     }

//     // Redirect directly to chat
//     this.router.navigate(['/chat']);
//   }
// }
