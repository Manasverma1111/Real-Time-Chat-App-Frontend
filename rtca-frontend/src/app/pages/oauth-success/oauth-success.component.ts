import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-oauth-success',
  template: `<div>Logging you in...</div>`,
})
export class OAuthSuccessComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      localStorage.setItem('connecthub_token', token);
    }

    this.router.navigate(['/']);
  }
}
