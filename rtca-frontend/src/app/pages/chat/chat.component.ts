import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
})
export class ChatComponent {
  constructor(private router: Router) {}

  handleLogout() {
    localStorage.removeItem('connecthub_token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('fullName');

    this.router.navigate(['/login']);
  }
}
