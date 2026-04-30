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
    if (!isPlatformBrowser(this.platformId)) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // ✅ Store token
    sessionStorage.setItem('connecthub_token', token);

    // 🔥 CRITICAL FIX: Fetch user from backend
    fetch('http://localhost:8087/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        // ✅ Store user properly
        sessionStorage.setItem('userId', user.userId);
        sessionStorage.setItem('username', user.username);
        sessionStorage.setItem('connecthub_user', JSON.stringify(user));

        this.router.navigate(['/chat']);
      })
      .catch((err) => {
        console.error('OAuth user fetch failed:', err);
        this.router.navigate(['/login']);
      });
  }
}
