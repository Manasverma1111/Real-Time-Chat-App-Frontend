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
      const username = params.get('username');
      const userId = params.get('userId');

      if (token) {
        // IMPORTANT FIX → use sessionStorage only
        sessionStorage.setItem('connecthub_token', token);
      }

      if (userId) {
        sessionStorage.setItem('userId', userId);
      }

      if (username) {
        sessionStorage.setItem('username', username);
      }

      this.router.navigate(['/chat']);
    }
  }
}
