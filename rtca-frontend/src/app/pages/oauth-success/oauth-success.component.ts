import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

// OAuthSuccessComponent: this component is responsible for handling the OAuth callback 
// after a successful authentication with an external provider (e.g., Google, Facebook). 
// When the user is redirected back to the application with an access token in the URL, 
// this component extracts the token, stores it in session storage, and then fetches the user's profile information from the backend API. 
// If the token is valid and the user information is successfully retrieved, it navigates the user to the main chat page. 
// If there is any issue (e.g., missing token, failed API call), it redirects the user back to the login page.
@Component({
  selector: 'app-oauth-success',
  template: `<div>Logging you in...</div>`,
})
export class OAuthSuccessComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  constructor(private router: Router) {}

  // ngOnInit: this lifecycle hook is called when the component is initialized. 
  // It first checks if the code is running in a browser environment (since window and sessionStorage are not available on the server). 
  // Then it extracts the 'token' parameter from the URL query string.
  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // Store token
    sessionStorage.setItem('connecthub_token', token);

    // CRITICAL FIX: Fetch user from backend
    fetch('http://localhost:8087/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        // Store user properly
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
